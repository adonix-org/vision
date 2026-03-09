import { Canvas } from "canvas";
import { ImageFrame } from "..";
import { Stage } from ".";

export class Watermark implements Stage {
    private readonly _text: string;
    constructor(
        text: string,
        private readonly fontSize: number = 80,
        private readonly padding: number = 20,
    ) {
        this._text = text;
    }

    protected getText(_frame: ImageFrame): string {
        return this._text;
    }

    public async draw(frame: ImageFrame, canvas: Canvas): Promise<Canvas> {
        const ctx = canvas.getContext("2d");

        ctx.font = `${this.fontSize}px sans-serif`;
        ctx.textBaseline = "bottom";
        ctx.textAlign = "right";

        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.shadowBlur = 6;

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";

        const x = canvas.width - this.padding;
        const y = canvas.height - this.padding;

        ctx.fillText(this.getText(frame), x, y);

        return canvas;
    }

    public toString(): string {
        return "[Watermark]";
    }
}
