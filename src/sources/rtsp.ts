import { Readable } from "node:stream";
import { Ffmpeg } from "../spawn/ffmpeg";

export interface StreamProvider {
    getStream(): Readable;
}

export class Rtsp extends Ffmpeg implements StreamProvider {
    constructor(private readonly url: string) {
        super();
    }

    protected override async args(): Promise<string[]> {
        const args = [
            "-loglevel",
            "fatal",
            "-rtsp_transport",
            "tcp",
            "-use_wallclock_as_timestamps",
            "1",
            "-i",
            this.url,
            "-an",
            "-c",
            "copy",
            "-f",
            "mpegts",
            "pipe:1",
        ];
        return args;
    }

    public getStream(): Readable {
        return this.child.stdout;
    }

    public override toString(): string {
        return `${super.toString()}[Rtsp]`;
    }
}
