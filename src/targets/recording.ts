import { Readable } from "node:stream";
import { promises as fs } from "node:fs";
import { Ffmpeg } from "../spawn/ffmpeg";
import { Broadcast } from "../sources/broadcast";
import { FilePath } from "../paths";

export type SupportedFileFormat = "mp4" | "mov";

export class Recording extends Ffmpeg {
    private stream: Readable | null = null;
    public timestamp: number | undefined;

    constructor(
        private readonly broadcast: Broadcast,
        private readonly filepath: FilePath,
        private readonly format: SupportedFileFormat = "mp4",
        private readonly audio: boolean = false,
    ) {
        super();
    }

    protected override args(): string[] {
        const args = [];

        args.push("-y");
        args.push("-i", "pipe:0");
        args.push("-c:v", "libx264");
        args.push("-preset", "ultrafast");
        args.push("-vf", "setpts=PTS-STARTPTS");

        if (this.audio) {
            args.push("-c:a", "aac");
            args.push("-af", "asetpts=PTS-STARTPTS");
        } else {
            args.push("-an");
        }

        args.push("-f", this.format);
        args.push(`${this.filepath.path}.${this.format}`);

        return args;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        await fs.mkdir(this.filepath.dirname, { recursive: true });

        this.stream = this.broadcast.subscribe(this.timestamp);
        this.stream.pipe(this.child.stdin);

        const cleanup = () => {
            this.stream?.destroy();
            this.stream = null;
        };

        this.child.stdin.on("close", cleanup);
        this.child.stdin.on("error", cleanup);
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        this.timestamp = undefined;

        this.stream?.unpipe();
        this.stream?.destroy();
        this.stream = null;

        this.end();

        await this.quit(5_000);
    }

    public override toString(): string {
        return `${super.toString()}[Recording]`;
    }
}
