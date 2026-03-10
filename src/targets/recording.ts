import { Readable } from "node:stream";
import { promises as fs } from "node:fs";
import { Ffmpeg } from "../spawn/ffmpeg";
import { Broadcast } from "../sources/broadcast";
import { FilePath } from "../paths";

type SupportedFileFormat = "mp4" | "mkv" | "mov" | "ts";

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

        this.audio;

        args.push("-y");
        args.push("-i", "pipe:0");
        args.push("-c:v", "libx264");
        args.push("-preset", "ultrafast");
        args.push("-c:a", "aac");
        args.push("-vf", "setpts=PTS-STARTPTS");
        args.push("-af", "asetpts=PTS-STARTPTS");
        args.push("-map", "0:v:0");
        args.push("-map", "0:a:0");
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
