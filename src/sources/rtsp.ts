import { Readable } from "node:stream";
import { Ffmpeg } from "../spawn/ffmpeg";
import { Broadcast } from "./broadcast";
import { Subscribers } from "./subscribers";

export class Rtsp extends Ffmpeg implements Broadcast {
    private readonly subscribers = new Subscribers(2 * 1024 * 1024);

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

        this.child.stdout.on("data", (chunk) => {
            this.subscribers.send(chunk);
        });
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        await this.quit();
    }

    public subscribe(): Readable {
        return this.subscribers.subscribe();
    }

    public override toString(): string {
        return `${super.toString()}[Rtsp]`;
    }
}
