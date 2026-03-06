import { ImageFrame, ImageTask } from "..";

export class Timer implements ImageTask {
    private count = 0;
    private duration = 0;

    constructor(
        private readonly task: ImageTask,
        interval = 5000,
    ) {
        setInterval(() => {
            if (this.count === 0) {
                return;
            }

            const avg = this.duration / this.count;
            console.info(
                this.toString(),
                `${avg.toFixed(3)}ms called ${this.count} times`,
            );
            this.count = 0;
            this.duration = 0;
        }, interval);
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const start = performance.now();
        const result = await this.task.process(frame);
        const end = performance.now();

        this.count++;
        this.duration += end - start;

        return result;
    }

    public toString(): string {
        return `[⏱️ Timer]${this.task.toString()}`;
    }
}
