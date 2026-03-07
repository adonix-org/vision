import { ImageDecoder } from "./image";

export abstract class JpegDecoder extends ImageDecoder {
    public static readonly SOI = Buffer.from([0xff, 0xd8]);
    public static readonly EOI = Buffer.from([0xff, 0xd9]);

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
