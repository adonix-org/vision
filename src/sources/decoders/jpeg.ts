import { ImageFrame } from "../../tasks";
import { ImageDecoder } from "./image";

export class JpegDecoder extends ImageDecoder {
    public static readonly SOI = Buffer.from([0xff, 0xd8]);
    public static readonly EOI = Buffer.from([0xff, 0xd9]);

    protected onimage(index: number, buffer: Buffer): ImageFrame {
        return {
            image: { buffer, contentType: "image/jpeg" },
            index,
            timestamp: Date.now(),
            version: 1,
            annotations: [],
        };
    }

    public override get vcodec(): string {
        return "mjpeg";
    }

    protected override get soi(): Buffer {
        return JpegDecoder.SOI;
    }

    protected override get eoi(): Buffer {
        return JpegDecoder.EOI;
    }

    public override toString(): string {
        return `${super.toString()}[JPEG]`;
    }
}
