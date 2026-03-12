import { AgentSource } from ".";
import { Lifecycle } from "../lifecycle";
import { signal } from "../constants";
import { ImageSource } from "../sources";
import { ErrorTask, ImageFrame, ImageTask } from "../tasks";
import { LogError } from "../tasks/error/log";

export abstract class Agent extends Lifecycle {
    private readonly imageTasks: ImageTask[] = [];
    private readonly errorTasks: ErrorTask[] = [];

    private finished: Promise<void> | null = null;

    protected constructor(
        private readonly source: AgentSource,
        ...children: Lifecycle[]
    ) {
        super(source, ...children);

        this.addErrorTask(new LogError());
    }

    protected addErrorTask(task: ErrorTask): this {
        this.errorTasks.push(task);
        return this;
    }

    protected addTask(task: ImageTask): this {
        this.imageTasks.push(task);
        return this;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.finished = this.run();
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        if (this.finished) {
            await this.finished;
            this.finished = null;
        }
    }

    protected oncomplete(): Promise<void> {
        return Promise.resolve(); // default no-op
    }

    protected onabort(): Promise<void> {
        return Promise.resolve(); // default no-op
    }

    private async run(): Promise<void> {
        while (!signal.aborted) {
            try {
                const image = await this.source.next();
                if (!image) break;

                await this.onimage(image);
            } catch (err) {
                void this.onerror(this.source, err);
            }

            await new Promise((res) => setImmediate(res));
        }

        if (signal.aborted) {
            await this.onabort();
        } else {
            await this.oncomplete();
        }
    }

    private async onimage(image: ImageFrame): Promise<void> {
        let current: ImageFrame | null = image;
        for (const task of this.imageTasks) {
            try {
                current = await task.process(current);
            } catch (err) {
                void this.onerror(task, err);
                return;
            }
            if (!current) return;
        }
    }

    private async onerror(
        source: ImageSource | ImageTask,
        err: unknown,
    ): Promise<void> {
        const error = err instanceof Error ? err : new Error(String(err));

        if (error.name === "AbortError") return;

        for (const task of this.errorTasks) {
            void task.handle({
                source: source.toString(),
                error,
                timestamp: Date.now(),
            });
        }
    }

    public override toString(): string {
        return `${super.toString()}[Agent]`;
    }
}
