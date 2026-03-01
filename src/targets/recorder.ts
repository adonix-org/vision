import { promises as fs } from "node:fs";
import { Ffmpeg } from "../spawn/ffmpeg";
import { StreamProvider } from "../sources/rtsp";
import { PassThrough } from "node:stream";
import { Filename } from "../utils/filename";
import path from "node:path";

export class Recorder extends Ffmpeg {
    private buffer: PassThrough | undefined;

    constructor(
        private readonly provider: StreamProvider,
        private readonly folder: string,
        private readonly extension: string = "mp4",
    ) {
        super();
    }

    protected override async args(): Promise<string[]> {
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
            "-i",
            "pipe:0",
            "-c",
            "copy",
            filepath,
        ];

        return args;
    }

    protected override async onstart(): Promise<void> {
        const source = this.provider.getStream()!;

        source.resume();

        await fs.mkdir(this.folder, { recursive: true });
        await super.onstart();

        this.buffer = new PassThrough({ highWaterMark: 256 * 1024 });
        source.pipe(this.buffer);
        this.buffer.pipe(this.child.stdin);
    }

    protected override async onstop(): Promise<void> {
        const source = this.provider.getStream()!;

        source.unpipe(this.buffer);
        await new Promise<void>((resolve) => {
            this.buffer!.once("finish", resolve);
            this.buffer!.end();
        });

        await super.onstop();
    }

    public override toString(): string {
        return `${super.toString()}[Recorder]`;
    }
}
