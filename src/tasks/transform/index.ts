import { Canvas, createCanvas, loadImage } from "canvas";
import { ImageFrame, ImageTask } from "..";

export interface Stage {
    transform(frame: ImageFrame, canvas: Canvas): Promise<Canvas>;

    toString(): string;
}

export class Transform implements ImageTask {
    private readonly stages: Stage[] = [];

    public add(transformer: Stage): void {
        this.stages.push(transformer);
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const image = await loadImage(frame.image.buffer);

        let canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);

        for (const stage of this.stages) {
            canvas = await stage.transform(frame, canvas);
        }

        frame.image.buffer = canvas.toBuffer("image/jpeg", { quality: 0.95 });

        return frame;
    }

    public toString(): string {
        return "Transform";
    }
}
