import { ImageFrame, ImageTask } from "../tasks";
import { Ffplay } from "../spawn/ffplay";
import { PassThrough } from "node:stream";
import { StreamProvider } from "../sources/rtsp";

type DataFormat = "mjpeg" | "mpegts";

export class Preview extends Ffplay implements ImageTask {
    constructor(
        private readonly provider: StreamProvider,
        private readonly format: DataFormat = "mjpeg",
        private readonly title = "Preview",
    ) {
        super();
    }

    protected override async args(): Promise<string[]> {
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

        const buffer = new PassThrough({ highWaterMark: 256 * 1024 });
        this.provider.getStream().pipe(buffer).pipe(this.child.stdin);
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        if (!this.running) return frame;

        this.child.stdin.write(frame.image.buffer);

        return frame;
    }

    public override toString(): string {
        return `${super.toString()}[Preview]`;
    }
}
