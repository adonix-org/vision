import { ImageFrame } from "../../tasks";
import { ImageQueue } from "../queue";

export abstract class ImageDecoder extends ImageQueue {
    private buffer: Buffer = Buffer.alloc(0);
    private offset = 0;

    public abstract get vcodec(): string;
    protected abstract get soi(): Buffer;
    protected abstract get eoi(): Buffer;
    protected abstract onimage(buffer: Buffer): ImageFrame;

    public override clear(): void {
        super.clear();
        this.buffer = Buffer.alloc(0);
        this.offset = 0;
    }

    public ondata(chunk: Buffer): void {
        const soi = this.soi;
        const eoi = this.eoi;

        if (this.offset === this.buffer.length) {
            this.buffer = chunk;
            this.offset = 0;
        } else {
            this.buffer = Buffer.concat(
                [this.buffer.subarray(this.offset), chunk],
                this.buffer.length - this.offset + chunk.length,
            );
            this.offset = 0;
        }

        while (true) {
            const start = this.buffer.indexOf(soi, this.offset);
            if (start === -1) break;

            const end = this.buffer.indexOf(eoi, start + soi.length);
            if (end === -1) break;

            const frame = this.buffer.subarray(start, end + eoi.length);
            this.push(this.onimage(frame));

            this.offset = end + eoi.length;
        }

        if (this.offset > 0) {
            if (this.offset === this.buffer.length) {
                this.buffer = Buffer.alloc(0);
                this.offset = 0;
            }
        }
    }

    public override toString(): string {
        return `${super.toString()}[ImageDecoder]`;
    }
}
