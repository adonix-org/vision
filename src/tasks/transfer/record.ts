import { promises as fs } from "fs";
import { ImageFrame, ImageTask } from "..";
import { CategoryPath } from "../../paths/category";
import { Broadcast } from "../../sources/broadcast";
import { Recording } from "../../targets/recording";
import { Lifecycle } from "../../lifecycle";

export class Record extends Lifecycle implements ImageTask {
    private timerId: NodeJS.Timeout | undefined;

    private readonly filepath = new CategoryPath(
        this.folder,
        this.category,
        this.category,
    );

    private readonly recording = new Recording(
        this.broadcast,
        this.filepath,
        "mp4",
    );

    constructor(
        private readonly broadcast: Broadcast,
        private readonly folder: string,
        private readonly preroll: number,
        private readonly postroll: number,
        private readonly category: string,
    ) {
        super();
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        await this.recording.stop();
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const activity = frame.annotations.some(
            (ann) => ann.active && ann.category === this.category,
        );

        if (activity) {
            if (!this.recording.running) {
                await fs.mkdir(this.filepath.dirname, { recursive: true });
                await fs.writeFile(
                    `${this.filepath.path}.jpg`,
                    frame.image.buffer,
                );

                this.recording.timestamp =
                    frame.timestamp - this.preroll * 1000;

                await this.recording.start();
            }

            if (this.timerId) clearTimeout(this.timerId);

            this.timerId = setTimeout(async () => {
                this.timerId = undefined;
                await this.recording.stop();
            }, this.postroll * 1_000);
        }

        return frame;
    }

    public override toString(): string {
        return `[Record-${this.category}]`;
    }
}
