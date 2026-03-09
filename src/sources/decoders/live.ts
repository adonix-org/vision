import { ImageFrame } from "../../tasks";
import { JpegDecoder } from "./jpeg";

export class LiveDecoder extends JpegDecoder {
    protected onimage(index: number, buffer: Buffer): ImageFrame {
        return {
            image: { buffer, contentType: "image/jpeg" },
            index,
            timestamp: Date.now(),
            version: 1,
            annotations: [],
        };
    }

    public override toString(): string {
        return `${super.toString()}[LiveDecoder]`;
    }
}
