import { ImageFrame, ImageTask } from "..";

export class PointFilter implements ImageTask {
    private readonly r2 = this.radius * this.radius;

    constructor(
        private readonly x: number,
        private readonly y: number,
        private readonly radius: number,
        private readonly tag: string = "point",
    ) {}

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const annotations = frame.annotations.map((annotation) => {
            if (!annotation.active) return annotation;

            const centerX = annotation.x + annotation.width / 2;
            const centerY = annotation.y + annotation.height / 2;

            const dx = centerX - this.x;
            const dy = centerY - this.y;
            const d2 = dx * dx + dy * dy;

            if (d2 <= this.r2) {
                return {
                    ...annotation,
                    active: false,
                    reason: `ignore ${this.tag}`,
                };
            }

            return annotation;
        });

        return {
            ...frame,
            annotations,
        };
    }

    public toString(): string {
        return "[PointFilter]";
    }
}
