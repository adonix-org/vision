import { ImageDecoder } from "./image";

export abstract class GifDecoder extends ImageDecoder {
    public static readonly SOI = Buffer.from("GIF89a", "ascii");
    public static readonly EOI = Buffer.from([0x3b]);

    public override get vcodec(): string {
        return "gif";
    }

    protected override get soi(): Buffer {
        return GifDecoder.SOI;
    }

    protected override get eoi(): Buffer {
        return GifDecoder.EOI;
    }

    public override toString(): string {
        return `${super.toString()}[GIF]`;
    }
}
