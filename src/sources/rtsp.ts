import { Readable } from "node:stream";
import { Ffmpeg } from "../spawn/ffmpeg";
import { Broadcast } from "./broadcast";
import { Subscribers } from "./subscribers";
import { MpegTsBuffer } from "./mpegts";

export abstract class Rtsp extends Ffmpeg implements Broadcast {
    private static readonly DEFAULT_HIGHWATER = 2 * 1024 * 1024;

    private readonly keyframes: MpegTsBuffer;

    private readonly subscribers: Subscribers;

    constructor(
        private readonly url: string,
        highwater = Rtsp.DEFAULT_HIGHWATER,
    ) {
        super();

        this.keyframes = new MpegTsBuffer(this);
        this.register(this.keyframes);

        this.subscribers = new Subscribers(highwater);
    }

    public abstract get name(): string;

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
        args.push("-f", "mpegts");
        args.push("pipe:1");

        return args;
    }

    public subscribe(): Readable {
        const subscriber = this.subscribers.subscribe();

        for (const chunk of this.keyframes.buffer()) {
            subscriber.write(chunk);
        }

        return subscriber;
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
