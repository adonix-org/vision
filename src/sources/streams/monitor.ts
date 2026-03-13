import { Readable } from "node:stream";
import { Lifecycle } from "../../lifecycle";
import { Broadcast, StreamFormat } from "./broadcast";

export class StreamMonitor extends Lifecycle implements Broadcast {
    private readonly _broadcast: Broadcast & Lifecycle;
    private stream: Readable | null = null;
    private timerId: NodeJS.Timeout | undefined;
    private last: number = 0;

    constructor(
        broadcast: Broadcast & Lifecycle,
        protected readonly timeout: number = 5_000,
    ) {
        super();

        this._broadcast = broadcast;

        this.register(broadcast);
    }

    protected get broadcast(): Lifecycle {
        return this._broadcast;
    }

    public get format(): StreamFormat {
        return this._broadcast.format;
    }

    public subscribe(timestamp?: number): Readable {
        return this._broadcast.subscribe(timestamp);
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.last = 0;

        this.stream = this._broadcast.subscribe();

        const success = await this.started(this.stream);
        if (!success) {
            await this.onfail();
            return;
        }

        this.monitor(this.stream);
    }

    protected override async onstop(): Promise<void> {
        clearTimeout(this.timerId);
        this.timerId = undefined;

        this.stream?.destroy();
        this.stream = null;

        await super.onstop();
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

        const check = async () => {
            const stalled = this.last < Date.now() - this.timeout;
            if (stalled) {
                await this.onstall();
            }

            this.timerId = setTimeout(check, this.timeout);
        };

        this.timerId = setTimeout(check, this.timeout);
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
