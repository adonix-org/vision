import { ImageTask, ImageFrame } from "..";

export class Throttle implements ImageTask {
    private open = true;

    constructor(fps: number = 1) {
        const interval = 1_000 / fps;

        setInterval(() => {
            this.open = true;
        }, interval);
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        if (!this.open) return null;

        this.open = false;
        return frame;
    }

    public toString(): string {
        return `[Throttle]`;
    }
}
