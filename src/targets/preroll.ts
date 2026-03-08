import { Readable } from "node:stream";
import { Lifecycle } from "../lifecycle";
import { Broadcast } from "../sources/broadcast";
import { Subscribers } from "../sources/subscribers";

interface TimedBuffer {
    chunk: Buffer;
    timestamp: number;
}

export class PreRoll extends Lifecycle implements Broadcast {
    private readonly preroll: TimedBuffer[] = [];
    private upstream: Readable | undefined;

    private readonly subscribers;
    private readonly maxAgeMs: number;

    constructor(
        private readonly broadcast: Broadcast,
        seconds: number = 10,
        kbps: number = 256,
    ) {
        super();

        this.maxAgeMs = 1000 * seconds;
        this.subscribers = new Subscribers(seconds * kbps * 1024);
    }

    public get name(): string {
        return `${this.broadcast.name}:preroll`;
    }

    public subscribe(timestamp?: number): Readable {
        const subscriber = this.subscribers.subscribe();

        if (timestamp === undefined) {
            return subscriber;
        }

        for (const entry of this.preroll) {
            if (entry.timestamp < timestamp) continue;

            const free = subscriber.write(entry.chunk);
            if (!free) {
                console.warn(
                    this.toString(),
                    `backpressure detected sending preroll`,
                );
            }
        }

        return subscriber;
    }

    public purge(): void {
        if (this.preroll.length === 0) return;

        let end = 0;
        const cutoffMs = Date.now() - this.maxAgeMs;

        for (const entry of this.preroll) {
            if (entry.timestamp >= cutoffMs) break;
            end++;
        }

        this.preroll.splice(0, end);
    }

    public get duration(): number {
        const oldest = this.preroll[0];
        const newest = this.preroll[this.preroll.length - 1];
        if (!oldest || !newest) return 0;

        return newest.timestamp - oldest.timestamp;
    }

    public get size(): number {
        let bytes = 0;
        for (const entry of this.preroll) {
            bytes += entry.chunk.length;
        }
        return bytes;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.preroll.length = 0;

        this.upstream = this.broadcast.subscribe();

        this.upstream.on("data", (chunk: Buffer) => {
            this.preroll.push({ chunk, timestamp: Date.now() });
            this.subscribers.send(chunk);

            this.purge();
        });
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        this.preroll.length = 0;
    }

    public override toString(): string {
        return `${super.toString()}[PreRoll]`;
    }
}
