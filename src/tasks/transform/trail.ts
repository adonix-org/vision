import { Stage } from ".";
import { ImageFrame } from "..";
import { Canvas } from "canvas";

export class Trail implements Stage {
    private readonly history: { x: number; y: number }[] = [];

    constructor(
        private readonly dotColor: string = "orange",
        private readonly radius: number = 3,
        private readonly maxPoints: number = 500,
    ) {}

    public async transform(frame: ImageFrame, canvas: Canvas): Promise<Canvas> {
        const ctx = canvas.getContext("2d");

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

        return canvas;
    }

    public toString(): string {
        return `[Trail]`;
    }
}
