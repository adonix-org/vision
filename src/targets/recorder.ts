import { promises as fs } from "node:fs";
import { Ffmpeg } from "../spawn/ffmpeg";
import { StreamProvider } from "../sources/rtsp";
import { Filename } from "../utils/filename";
import path from "node:path";
import { BufferedPipe } from "./pipe";

export class Recorder extends Ffmpeg {
    private pipe: BufferedPipe | undefined;

    constructor(
        private readonly provider: StreamProvider,
        private readonly folder: string,
        private readonly extension: string = "mp4",
    ) {
        super();
    }

    protected override args(): string[] {
        const filename = new Filename(this.folder, "movie").getFilename();

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
        await fs.mkdir(this.folder, { recursive: true });

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

    public override toString(): string {
        return `${super.toString()}[Recorder]`;
    }
}
