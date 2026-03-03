import { Readable, PassThrough } from "stream";
import { Lifecycle } from "../lifecycle";
import { Broadcast } from "../sources/broadcast";

export class PreRoll extends Lifecycle implements Broadcast {
    private readonly buffer: Buffer[] = [];
    private size = 0;

    constructor(
        private readonly broadcast: Broadcast,
        private readonly maxSize: number = 128 * 1024,
    ) {
        super();
    }

    public getStream(): Readable {
        const out = new PassThrough();

        // 1️⃣ Write preroll first
        for (const chunk of this.buffer) {
            out.write(chunk);
        }

        // 2️⃣ Hook live upstream directly to this consumer
        const upstream = this.broadcast.getStream();

        const onData = (chunk: Buffer) => {
            out.write(chunk);
        };

        upstream.on("data", onData);

        const cleanup = () => {
            upstream.off("data", onData);
            out.end();
        };

        out.on("close", cleanup);
        out.on("error", cleanup);

        return out;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.buffer.length = 0;
        this.size = 0;

        const upstream = this.broadcast.getStream();

        upstream.on("data", (chunk: Buffer) => {
            // maintain preroll
            this.buffer.push(chunk);
            this.size += chunk.length;

            while (this.size > this.maxSize && this.buffer.length) {
                const removed = this.buffer.shift()!;
                this.size -= removed.length;
            }
        });
    }
}
