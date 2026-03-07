import { ImageFrame, ImageTask } from "..";

export class Ignore implements ImageTask {
    constructor(private readonly category: string) {}

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const annotations = frame.annotations.map((annotation) => {
            if (!annotation.active) return annotation;

            if (annotation.label === this.category) {
                annotation.reason = `ignore ${this.category}`;
                annotation.active = false;
            }

            return annotation;
        });

        return {
            ...frame,
            annotations,
        };
    }

    public toString(): string {
        return "[Ignore]";
    }
}
