import { PassThrough, Readable } from "stream";
import { Lifecycle } from "../lifecycle";
import { Broadcast } from "../sources/broadcast";

export class PreRoll extends Lifecycle implements Broadcast {
    private readonly stream = new PassThrough();
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

        for (const chunk of this.buffer) {
            out.write(chunk);
        }

        return this.stream.pipe(out);
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.buffer.length = 0;
        this.size = 0;

        const upstream = this.broadcast.getStream();

        upstream.on("data", (chunk: Buffer) => {
            this.buffer.push(chunk);
            this.size += chunk.length;

            while (this.size > this.maxSize && this.buffer.length) {
                const removed = this.buffer.shift()!;
                this.size -= removed.length;
            }

            this.stream.write(chunk);
        });

        upstream.on("end", () => {
            this.stream.end();
        });
    }
}
