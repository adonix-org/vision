import { Readable } from "node:stream";
import { promises as fs } from "node:fs";
import { Ffmpeg } from "../spawn/ffmpeg";
import { Broadcast } from "../sources/broadcast";
import { FilePath } from "../paths";

type SupportedFileFormat = "mp4" | "mkv" | "mov" | "ts";

export class Recording extends Ffmpeg {
    private stream: Readable | null = null;

    constructor(
        private readonly broadcast: Broadcast,
        private readonly filepath: FilePath,
        private readonly format: SupportedFileFormat = "mp4",
    ) {
        super();
    }

    protected override args(): string[] {
        const args = [
            "-loglevel",
            "fatal",
            "-y",
            "-f",
            "mpegts",
            "-use_wallclock_as_timestamps",
            "0",
            "-i",
            "pipe:0",
            "-avoid_negative_ts",
            "make_zero",
            "-copyts",
            "-c",
            "copy",
            "-f",
            this.format,
            `${this.filepath.path}.${this.format}`,
        ];

        return args;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        await fs.mkdir(this.filepath.dirname, { recursive: true });

        this.stream = this.broadcast.subscribe();
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

        this.stream?.unpipe();
        this.stream?.destroy();
        this.stream = null;

        this.child.stdin.end();

        await this.quit(5_000);
    }

    public override toString(): string {
        return `${super.toString()}[Recording]`;
    }
}
