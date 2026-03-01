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
        this.buffer.pipe(this.output);

        this.input.pipe(this.buffer);
    }

    public async end(): Promise<void> {
        const buffer = this.buffer;
        if (!buffer) return;

        this.input.unpipe(buffer);
        await new Promise<void>((resolve) => {
            buffer.once("finish", resolve);
            buffer.end();
        });

        buffer.unpipe(this.output);
        await new Promise<void>((resolve) => {
            this.output.once("finish", resolve);
            this.output.end();
        });
    }

    public toString(): string {
        return `[BufferedPipe]`;
    }
}
