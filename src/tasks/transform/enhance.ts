import sharp from "sharp";
import { ImageFrame, ImageTask } from "..";

export class Enhance implements ImageTask {
    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const enhancedBuffer = await sharp(frame.image.buffer)
            .modulate({ brightness: 1.05, saturation: 1.25 })
            .linear(1.1, -10)
            .gamma(1.05)
            .sharpen({ sigma: 2.0 })
            .toBuffer();

        return { ...frame, image: { ...frame.image, buffer: enhancedBuffer } };
    }

    public toString(): string {
        return "[Enhance]";
    }
}
