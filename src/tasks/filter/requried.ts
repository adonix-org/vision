import { ImageFrame, ImageTask } from "..";

export class Required implements ImageTask {
    private readonly labels: Set<string>;

    constructor(label: string, ...labels: string[]) {
        this.labels = new Set([label, ...labels]);
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const present = frame.annotations.some(
            (annotation) =>
                annotation.active && this.labels.has(annotation.label),
        );

        return present ? frame : null;
    }

    public toString(): string {
        return `[Required]`;
    }
}
