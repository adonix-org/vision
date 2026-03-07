import { ImageDecoder } from "./image";

export abstract class PngDecoder extends ImageDecoder {
    public static readonly SOI = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    public static readonly EOI = Buffer.from([
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    public override get vcodec(): string {
        return "png";
    }

    protected override get soi(): Buffer {
        return PngDecoder.SOI;
    }

    protected override get eoi(): Buffer {
        return PngDecoder.EOI;
    }

    public override toString(): string {
        return `${super.toString()}[PNG]`;
    }
}
