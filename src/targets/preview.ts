import { ImageFrame, ImageTask } from "../tasks";
import { Ffplay } from "../spawn/ffplay";
import { StreamProvider } from "../sources/rtsp";
import { BufferedPipe } from "./pipe";

type DataFormat = "mjpeg" | "mpegts";

export class Preview extends Ffplay implements ImageTask {
    private pipe: BufferedPipe | undefined;

    constructor(
        private readonly provider: StreamProvider,
        private readonly format: DataFormat = "mjpeg",
        private readonly title = "Preview",
    ) {
        super();
    }

    protected override args(): string[] {
        const args = [
            "-loglevel",
            "quiet",
            "-f",
            this.format,
            "-i",
            "pipe:0",
            "-window_title",
            this.title,
        ];
        return args;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.pipe = new BufferedPipe(
            this.provider.getStream(),
            this.child.stdin,
        );

        await this.pipe.start();
    }

    protected override async onstop(): Promise<void> {
        await this.pipe?.end();

        await super.onstop();
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        if (!this.running) return frame;

        return frame;
    }

    public override toString(): string {
        return `${super.toString()}[Preview]`;
    }
}
