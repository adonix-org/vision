import sharp from "sharp";
import { ImageFrame } from "..";
import { Workflow } from "../../workflows/workflow";
import { SaveImage } from "../transfer/save";
import { Remote } from "../remote/remote";
import { DatePath } from "../../paths/date";

export class Extract extends Workflow {
    constructor(folder: string) {
        super();

        this.addTask(new Remote("grayscale"));
        this.addTask(new SaveImage(new DatePath(folder, "image")));
    }

    public override async process(frame: ImageFrame): Promise<ImageFrame> {
        const image = sharp(frame.image.buffer);

        for (const annotation of frame.annotations) {
            const { x, y, width, height } = annotation;
            if (width < 5 || height < 5) continue;

            const subject = await image
                .clone()
                .extract({ left: x, top: y, width, height })
                .jpeg()
                .toBuffer();

            this.push({
                ...frame,
                image: {
                    buffer: subject,
                    contentType: "image/jpeg",
                },
            });
        }

        return frame;
    }

    public override toString(): string {
        return `${super.toString()}[Extract]`;
    }
}
