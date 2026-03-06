import { Stage } from ".";
import { ImageFrame } from "..";
import { Canvas } from "canvas";

export class Label implements Stage {
    private readonly lineWidth = 2;
    private readonly textFont: string;
    private readonly textStrokeColor = "black";
    private readonly textFillColor = "white";

    constructor(
        private readonly color: string = "yellow",
        private readonly fontSize: number = 36,
        private readonly inactiveColor?: string,
    ) {
        this.textFont = `${this.fontSize}px sans-serif`;
    }

    public async draw(frame: ImageFrame, canvas: Canvas): Promise<Canvas> {
        const ctx = canvas.getContext("2d");

        ctx.font = this.textFont;

        for (const ann of frame.annotations) {
            const isActive = ann.active;
            if (!isActive && !this.inactiveColor) continue;

            const borderColor = isActive ? this.color : this.inactiveColor!;
            const fillColor = this.textFillColor;

            ctx.strokeStyle = borderColor;
            ctx.lineWidth = this.lineWidth;
            ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);

            const confidence = ann.confidence ?? 0;
            const text = ann.confidence
                ? `${ann.label} • ${Math.round(confidence * 100)}%`
                : ann.label;

            const centerX = ann.x + ann.width / 2;
            const topY = ann.y - 2;

            ctx.lineWidth = 3;
            ctx.strokeStyle = this.textStrokeColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.strokeText(text, centerX, topY);
            ctx.fillStyle = fillColor;
            ctx.fillText(text, centerX, topY);

            ctx.font = `${this.fontSize}px sans-serif`;
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            ctx.strokeStyle = this.textStrokeColor;

            const infoText = isActive ? ann.model : ann.reason;
            const infoY = ann.y + ann.height + 2;
            ctx.strokeText(infoText, centerX, infoY);
            ctx.fillText(infoText, centerX, infoY);

            ctx.font = this.textFont;
        }

        return canvas;
    }

    public toString(): string {
        return "[Label]";
    }
}
