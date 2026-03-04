import { Readable } from "node:stream";
import { promises as fs } from "node:fs";
import { Ffmpeg } from "../spawn/ffmpeg";
import { Filename } from "../utils/filename";
import path from "node:path";
import { Broadcast } from "../sources/broadcast";

export class Recording extends Ffmpeg {
    private stream: Readable | undefined;

    constructor(
        private readonly broadcast: Broadcast,
        private readonly folder: string,
        private readonly extension: string = "mp4",
    ) {
        super();
    }

    protected override args(): string[] {
        const filename = new Filename(this.folder, "video").getFilename();

        const filepath = path.join(
            this.folder,
            `${filename}.${this.extension}`,
        );

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
    }

    public override toString(): string {
        return `${super.toString()}[Recording]`;
    }
}
