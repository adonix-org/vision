import { PassThrough, Readable, Writable } from "node:stream";
import { finished } from "node:stream/promises";

export class BufferedPipe {
    private readonly branch = new PassThrough({
        highWaterMark: 1024 * 1024,
        allowHalfOpen: true,
    });

    private ended = false;

    constructor(
        private readonly source: Readable,
        private readonly output: Writable,
    ) {}

    public async start(): Promise<void> {
        if (this.ended) return;

        this.source.pipe(this.branch, { end: false });
        this.branch.pipe(this.output, { end: false });

        this.output.on("error", (err: NodeJS.ErrnoException) => {
            if (err.code === "EPIPE" || err.code === "ECONNRESET") {
                console.warn(
                    this.toString(),
                    `slow/broken consumer detected (${err.code}) — isolating`,
                );
            } else {
                console.error(this.toString(), err);
            }

            this.stop();
        });

        this.output.once("close", () => this.stop());
    }

    public async stop(): Promise<void> {
        if (this.ended) return;
        this.ended = true;

        this.branch.unpipe(this.output);
        this.branch.end();

        this.output.end();

        try {
            await finished(this.branch, { writable: true, readable: false });
        } catch (err) {
            console.error(this.toString(), err);
        }
    }

    public toString() {
        return "[BufferedPipe]";
    }
}
