import { Readable } from "node:stream";
import { Lifecycle } from "../../lifecycle";
import { Broadcast, StreamFormat } from "./broadcast";

export class StreamMonitor extends Lifecycle implements Broadcast {
    private stream: Readable | null = null;
    private timerId: NodeJS.Timeout | undefined;
    private last: number = 0;

    constructor(
        private readonly broadcast: Broadcast & Lifecycle,
        private readonly timeout: number = 5_000,
    ) {
        super();

        this.register(broadcast);
    }

    public get format(): StreamFormat {
        return this.broadcast.format;
    }

    public subscribe(timestamp?: number): Readable {
        return this.broadcast.subscribe(timestamp);
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.last = 0;

        this.stream = this.broadcast.subscribe();

        const success = await this.started(this.stream);
        if (!success) {
            await this.onfail();
            return;
        }

        this.monitor(this.stream);
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        clearInterval(this.timerId);

        this.stream?.destroy();
        this.stream = null;
    }

    private async started(stream: Readable): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const timer = setTimeout(async () => {
                resolve(false);
            }, this.timeout);

            stream.once("data", () => {
                clearTimeout(timer);
                this.last = Date.now();
                resolve(true);
            });
        });
    }

    private monitor(stream: Readable): void {
        stream.on("data", () => {
            this.last = Date.now();
        });

        clearInterval(this.timerId);

        this.timerId = setInterval(async () => {
            if (this.last < Date.now() - this.timeout) {
                await this.onstall();
            }
        }, this.timeout);
    }

    protected async onstall(): Promise<void> {
        console.warn(this.toString(), `stream stalled ${this.timeout} ms`);

        await this.broadcast.stop();
        await this.broadcast.start();
    }

    protected async onfail(): Promise<void> {
        console.warn(this.toString(), `stream failed to start`);

        this.stop();
    }

    public override toString(): string {
        return `${super.toString()}[StreamMonitor]`;
    }
}
