import { Readable } from "node:stream";
import { Ffmpeg } from "../spawn/ffmpeg";
import { Broadcast, StreamFormat } from "./streams/broadcast";
import { Subscribers } from "./streams/subscribers";

export abstract class Rtsp extends Ffmpeg implements Broadcast {
    private static readonly DEFAULT_HIGHWATER = 2 * 1024 * 1024;

    private readonly subscribers: Subscribers;

    constructor(
        private readonly url: string,
        highwater = Rtsp.DEFAULT_HIGHWATER,
    ) {
        super();

        this.subscribers = new Subscribers(highwater);
    }

    public get format(): StreamFormat {
        return "mpegts";
    }

    protected override args(): string[] {
        const args: string[] = [];

        args.push("-rtsp_transport", "tcp");
        args.push("-use_wallclock_as_timestamps", "1");
        args.push("-i", this.url);
        args.push("-map", "0");
        args.push("-c:v", "copy");
        args.push("-c:a", "aac");
        args.push("-ar", "48000");
        args.push("-ac", "2");
        args.push("-f", this.format);
        args.push("pipe:1");

        return args;
    }

    public subscribe(): Readable {
        return this.subscribers.subscribe();
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

    public override toString(): string {
        return `${super.toString()}[Rtsp]`;
    }
}
