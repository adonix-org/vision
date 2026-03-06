import { ImageFrame, ImageTask } from "..";
import { createCanvas, loadImage } from "canvas";

export class Label implements ImageTask {
    private readonly lineWidth = 2;
    private readonly textFont: string;
    private readonly textAlign: CanvasTextAlign = "left";
    private readonly textBaseline: CanvasTextBaseline = "top";
    private readonly textStrokeColor = "black";
    private readonly textFillColor = "white";

    constructor(
        private readonly boxColor: string = "red",
        private readonly fontSize: number = 16,
    ) {
        this.textFont = `${this.fontSize}px sans-serif`;
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        if (!frame.annotations || frame.annotations.length === 0) {
            return frame;
        }

        const img = await loadImage(frame.image.buffer);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        ctx.strokeStyle = this.boxColor;
        ctx.lineWidth = this.lineWidth;
        ctx.font = this.textFont;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;

        for (const ann of frame.annotations) {
            ctx.strokeStyle = this.boxColor;
            ctx.lineWidth = this.lineWidth;
            ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);

            const text = ann.confidence
                ? `${ann.label} (${(ann.confidence * 100).toFixed(1)}%)`
                : ann.label;

            const centerX = ann.x + ann.width / 2;
            const topY = ann.y - 2;

            ctx.lineWidth = 3;
            ctx.strokeStyle = this.textStrokeColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.strokeText(text, centerX, topY);

            ctx.fillStyle = this.textFillColor;
            ctx.fillText(text, centerX, topY);
        }

        frame.image.buffer = canvas.toBuffer("image/jpeg", { quality: 0.95 });

        return frame;
    }

    public toString(): string {
        return `[Label]`;
    }
}
