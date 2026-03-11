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
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.stream = this.broadcast.subscribe();
        this.stream.on("data", () => {
            this.last = Date.now();
        });

        this.timerId = setInterval(async () => {
            if (this.last < Date.now() - this.timeout) {
                console.error(this.toString(), `no data in ${this.timeout} ms`);
                await this.broadcast.stop();
                await this.broadcast.start();
            }
        }, this.timeout);
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        clearInterval(this.timerId);

        this.stream?.removeAllListeners();
        this.stream?.unpipe();
        this.stream?.destroy();

        this.stream = null;
    }

    public override toString(): string {
        return `${super.toString()}[StreamMonitor]`;
    }
}
