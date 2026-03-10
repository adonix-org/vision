import { Readable } from "node:stream";
import { Broadcast, StreamFormat } from "../sources/broadcast";
import { Subscribers } from "../sources/subscribers";
import { Ffmpeg } from "../spawn/ffmpeg";

export abstract class Encoder extends Ffmpeg implements Broadcast {
    private static readonly DEFAULT_HIGHWATER = 4 * 1024 * 1024;

    private readonly subscribers: Subscribers;

    constructor(private readonly fps: number) {
        super();

        this.subscribers = new Subscribers(Encoder.DEFAULT_HIGHWATER);
    }

    protected override args(): string[] {
        const args: string[] = [];

        args.push("-fflags", "nobuffer");
        args.push("-f", "image2pipe");
        args.push("-vcodec", "mjpeg");
        args.push("-r", `${this.fps}`);
        args.push("-i", "-");
        args.push("-c:v", "libx264");
        args.push("-preset", "veryfast");
        args.push("-tune", "zerolatency");
        args.push("-g", "1");
        args.push("-f", "mpegts");
        args.push("-");

        return args;
    }

    public subscribe(): Readable {
        return this.subscribers.subscribe();
    }

    public get format(): StreamFormat {
        return "mpegts";
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.child.stdout.on("data", (chunk) => {
            this.subscribers.send(chunk);
        });
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        this.end();

        await this.quit(5_000);
    }

    public override toString(): string {
        return `${super.toString()}[Encoder]`;
    }
}
