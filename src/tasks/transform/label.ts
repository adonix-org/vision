import { Stage } from ".";
import { ImageFrame } from "..";
import { Canvas } from "canvas";

export class Label implements Stage {
    private readonly lineWidth = 2;
    private readonly textFont: string;
    private readonly textAlign: CanvasTextAlign = "left";
    private readonly textBaseline: CanvasTextBaseline = "top";
    private readonly textStrokeColor = "black";
    private readonly textFillColor = "white";

    constructor(
        private readonly boxColor: string = "yellow",
        private readonly fontSize: number = 36,
    ) {
        this.textFont = `${this.fontSize}px sans-serif`;
    }

    public async transform(frame: ImageFrame, canvas: Canvas): Promise<Canvas> {
        const ctx = canvas.getContext("2d");

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

        return canvas;
    }

    public toString(): string {
        return `[Label]`;
    }
}
