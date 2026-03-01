import { ImageFrame, ImageTask } from "../tasks";
import { StreamProvider } from "../sources/rtsp";
import { BufferedPipe } from "./pipe";
import { Executable } from "../spawn/executable";

export class MPV extends Executable implements ImageTask {
    private pipe: BufferedPipe | undefined;

    constructor(
        private readonly provider: StreamProvider,
        private readonly title: string = "Publisher",
    ) {
        super();
    }

    protected override executable(): string {
        return "/opt/homebrew/bin/mpv";
    }

    protected override args(): string[] {
        const args = ["--cache=no", `--title=${this.title}`, "-"];
        return args;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.child.stdout.on("data", (chunk) => {
            console.info(chunk.toString());
        });

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
        return `${super.toString()}[MPV]`;
    }
}
