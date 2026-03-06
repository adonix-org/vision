import { createCanvas, loadImage } from "canvas";
import { ImageFrame, ImageTask } from "..";

export class SimpleWatermark implements ImageTask {
    constructor(
        private readonly text: string,
        private readonly fontSize: number = 80,
        private readonly padding: number = 20,
    ) {}

    public async process(frame: ImageFrame): Promise<ImageFrame> {
        const img = await loadImage(frame.image.buffer);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, img.width, img.height);

        ctx.font = `${this.fontSize}px sans-serif`;
        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(255,255,255,0.5)";

        const x = img.width - this.padding;
        const y = img.height - this.padding;

        ctx.fillText(this.text, x, y);

        return {
            ...frame,
            image: {
                ...frame.image,
                buffer: canvas.toBuffer("image/jpeg", { quality: 0.9 }),
            },
        };
    }

    public toString(): string {
        return "[SimpleWatermark]";
    }
}
