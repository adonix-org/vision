import { ImageFrame } from "../../tasks";
import { JpegDecoder } from "./formats";

export class FixedFpsDecoder extends JpegDecoder {
    private readonly frameDuration: number;
    private frameIndex = 0;

    constructor(fps: number) {
        super();
        this.frameDuration = 1 / fps;
    }

    protected override onimage(buffer: Buffer): ImageFrame {
        const seek = this.frameIndex * this.frameDuration;
        this.frameIndex++;

        return {
            image: { buffer, contentType: "image/jpeg" },
            seek,
            version: 1,
            annotations: [],
        };
    }

    public override toString(): string {
        return `${super.toString()}[FixedFpsDecoder]`;
    }
}
