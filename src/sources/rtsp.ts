import { Readable } from "node:stream";
import { Ffmpeg } from "../spawn/ffmpeg";
import { Broadcast } from "./broadcast";

export class Rtsp extends Ffmpeg implements Broadcast {
    constructor(private readonly url: string) {
        super();
    }

    protected override args(): string[] {
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

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.child.stdout.resume();
    }

    public getReadable(): Readable {
        return this.child.stdout;
    }

    public override toString(): string {
        return `${super.toString()}[Rtsp]`;
    }
}
