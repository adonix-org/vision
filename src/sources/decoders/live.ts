import { ImageFrame } from "../../tasks";
import { JpegDecoder } from "./formats";

export class LiveDecoder extends JpegDecoder {
    protected onimage(buffer: Buffer): ImageFrame {
        return {
            image: { buffer, contentType: "image/jpeg" },
            seek: Date.now() / 1000,
            version: 1,
            annotations: [],
        };
    }

    public override toString(): string {
        return `${super.toString()}[LiveDecoder]`;
    }
}
