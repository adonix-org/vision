import { Readable } from "node:stream";
import { promises as fs } from "node:fs";
import { Ffmpeg } from "../spawn/ffmpeg";
import { Filename } from "../utils/filename";
import path from "node:path";
import { Broadcast } from "../sources/broadcast";

type SupportedFileFormat = "mp4" | "mkv" | "mov" | "ts";

export class Recording extends Ffmpeg {
    private stream: Readable | null = null;

    constructor(
        private readonly broadcast: Broadcast,
        private readonly folder: string,
        private readonly format: SupportedFileFormat = "mp4",
    ) {
        super();
    }

    protected override args(): string[] {
        const filename = new Filename(this.folder, "video").getFilename();

        const filepath = path.join(this.folder, `${filename}.${this.format}`);

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
            filepath,
        ];

        return args;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        await fs.mkdir(this.folder, { recursive: true });

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

        this.quit(5_000);
    }

    protected override async quit(afterMs?: number): Promise<void> {
        this.child.stdin.end();

        await super.quit(afterMs);
    }

    public override toString(): string {
        return `${super.toString()}[Recording]`;
    }
}
