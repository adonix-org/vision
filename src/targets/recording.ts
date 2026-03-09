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
        private readonly audio: boolean = true,
    ) {
        super();
    }

    protected override args(): string[] {
        const args = [];

        args.push("-loglevel", "fatal");
        args.push("-y");
        args.push("-f", "mpegts");
        args.push("-use_wallclock_as_timestamps", "0");
        args.push("-i", "pipe:0");
        args.push("-avoid_negative_ts", "make_zero");
        args.push("-copyts");
        // args.push("-map", "0:v");

        if (this.audio) this.audio;

        args.push("-c", "copy");
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

        this.child.stdin.end();

        await this.quit(5_000);
    }

    public override toString(): string {
        return `${super.toString()}[Recording]`;
    }
}
