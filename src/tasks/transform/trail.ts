import { ImageFrame, ImageTask } from "..";
import { createCanvas, loadImage } from "canvas";

export class Trail implements ImageTask {
    private readonly history: { x: number; y: number }[] = [];

    constructor(
        private readonly dotColor: string = "lime",
        private readonly radius: number = 3,
        private readonly maxPoints: number = 500,
    ) {}

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const img = await loadImage(frame.image.buffer);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        if (frame.annotations && frame.annotations.length > 0) {
            for (const ann of frame.annotations) {
                const centerX = ann.x + ann.width / 2;
                const centerY = ann.y + ann.height / 2;
                this.history.push({ x: centerX, y: centerY });
            }

            while (this.history.length > this.maxPoints) {
                this.history.shift();
            }
        }

        ctx.fillStyle = this.dotColor;
        for (const point of this.history) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        frame.image.buffer = canvas.toBuffer("image/jpeg", { quality: 0.95 });
        return frame;
    }

    public toString(): string {
        return `[Trail]`;
    }
}
