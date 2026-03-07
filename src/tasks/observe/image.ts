import { ImageFrame, ImageTask } from "..";
import { Executable } from "../../spawn/executable";

export class ImageViewer extends Executable implements ImageTask {
    constructor(private readonly title = "Image Viewer") {
        super();
    }

    protected override executable(): string {
        return "/opt/homebrew/bin/ffplay";
    }

    protected override args(): string[] {
        const args = [
            "-loglevel",
            "quiet",
            "-fflags",
            "nobuffer",
            "-flags",
            "low_delay",
            "-probesize",
            "32",
            "-analyzeduration",
            "0",
            "-vf",
            "setpts=0",
            "-sync",
            "video",
            "-framedrop",
            "-f",
            "mjpeg",
            "-i",
            "pipe:0",
            "-autoexit",
            "-window_title",
            this.title,
        ];

        return args;
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        if (!this.running) return frame;

        this.child.stdin.write(frame.image.buffer);

        return frame;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.child.stdin.on("error", (err) => {
            if (!("code" in err && err.code === "EPIPE")) {
                console.error(this.toString(), err);
            }
        });
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        this.end();

        await this.quit(5_000);
    }

    public override toString(): string {
        return `${super.toString()}[ImageViewer]`;
    }
}
