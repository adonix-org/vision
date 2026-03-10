import { Readable } from "node:stream";
import { Lifecycle } from "../lifecycle";
import { Broadcast, StreamFormat } from "../sources/broadcast";
import { Subscribers } from "../sources/subscribers";
import { MpegTsBuffer } from "../sources/mpegts";

export class PreRoll extends Lifecycle implements Broadcast {
    private upstream: Readable | null = null;

    public buffer: MpegTsBuffer;

    private readonly subscribers;

    constructor(
        private readonly broadcast: Broadcast,
        seconds: number = 10,
        kbps: number = 256,
    ) {
        super();

        const maxAgeMs = 1_000 * seconds;
        this.subscribers = new Subscribers(seconds * kbps * 1024);

        this.buffer = new MpegTsBuffer(broadcast, maxAgeMs);
        this.register(this.buffer);
    }

    public get format(): StreamFormat {
        return this.broadcast.format;
    }

    public subscribe(cutoff: number): Readable {
        const subscriber = this.subscribers.subscribe();

        for (const chunk of this.buffer.buffer(cutoff)) {
            const free = subscriber.write(chunk);
            if (!free) {
                console.warn(
                    this.toString(),
                    "backpressure detected sending preroll",
                );
            }
        }

        return subscriber;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.upstream = this.broadcast.subscribe();
        this.upstream.on("data", (chunk) => {
            this.subscribers.send(chunk);
        });
    }

    public override toString(): string {
        return `${super.toString()}[PreRoll]`;
    }
}
