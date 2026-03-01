import { promises as fs } from "node:fs";
import { Ffmpeg } from "../spawn/ffmpeg";
import { StreamProvider } from "../sources/rtsp";
import { PassThrough } from "node:stream";
import { UniqueFile } from "../utils/unique";
import path from "node:path";

export class Recorder extends Ffmpeg {
    constructor(
        private readonly provider: StreamProvider,
        private readonly folder: string,
        private readonly extension: string = "mp4",
    ) {
        super();
    }

    protected override async args(): Promise<string[]> {
        const filename = await new UniqueFile(
            this.folder,
            "movie",
        ).getFilename();

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
            "-i",
            "pipe:0",
            "-c",
            "copy",
            filepath,
        ];

        return args;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        await fs.mkdir(this.folder, { recursive: true });

        const buffer = new PassThrough({ highWaterMark: 256 * 1024 });
        this.provider.getStream().pipe(buffer).pipe(this.child.stdin);

        await fs.mkdir(this.folder, { recursive: true });
    }

    public override toString(): string {
        return `${super.toString()}[Recorder]`;
    }
}
