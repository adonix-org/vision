import { ImageFrame } from "..";
import { Watermark } from "./watermark";

export class Timestamp extends Watermark {
    constructor(fontSize?: number, padding?: number) {
        super("", fontSize, padding);
    }
    protected override getText(frame: ImageFrame): string {
        const date = new Date(frame.timestamp);

        return date.toISOString();
    }
}
