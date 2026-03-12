import { Readable } from "node:stream";
import { Lifecycle } from "../../lifecycle";
import { Broadcast } from "../broadcast";

export class StreamMonitor extends Lifecycle {
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

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.stream = this.broadcast.subscribe();
        this.stream.on("data", () => {
            this.last = Date.now();
        });

        const success = await this.started(this.stream);
        if (!success) {
            this.stop();
            return;
        }

        this.monitor();
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        clearInterval(this.timerId);

        this.stream?.destroy();
        this.stream = null;
    }

    private async started(stream: Readable): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const timer = setTimeout(() => {
                console.warn(
                    this.toString(),
                    `${this.broadcast.toString()} timeout starting stream`,
                );
                resolve(false);
            }, this.timeout);

            stream.once("data", () => {
                clearTimeout(timer);
                this.last = Date.now();
                resolve(true);
            });
        });
    }

    private monitor(): void {
        this.timerId = setInterval(async () => {
            if (this.last < Date.now() - this.timeout) {
                console.warn(
                    this.toString(),
                    `stream stalled ${this.timeout} ms`,
                );
                await this.broadcast.stop();
                await this.broadcast.start();
            }
        }, this.timeout);
    }

    public override toString(): string {
        return `${super.toString()}[StreamMonitor]`;
    }
}
