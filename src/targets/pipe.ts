import { PassThrough, Readable, Writable } from "node:stream";

export class BufferedPipe {
    private buffer: PassThrough | undefined;

    constructor(
        private readonly input: Readable,
        private readonly output: Writable,
    ) {}

    public async start(): Promise<void> {
        this.input.resume();

        this.buffer = new PassThrough({ highWaterMark: 256 * 1024 });
        this.input.pipe(this.buffer);
        this.buffer.pipe(this.output);
    }

    public async end(): Promise<void> {
        if (!this.buffer) return;

        const buffer = this.buffer;

        this.input.unpipe(buffer);

        await new Promise<void>((resolve) => {
            buffer.once("finish", resolve);
            buffer.end();
        });

        this.buffer = undefined;
    }

    public toString(): string {
        return `[BufferedPipe]`;
    }
}
