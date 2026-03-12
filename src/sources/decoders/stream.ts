import { ImageSource } from "..";
import { ImageDecoder } from "./image";
import { Ffmpeg } from "../../spawn/ffmpeg";
import { ImageFrame } from "../../tasks";
import { Broadcast } from "../streams/broadcast";
import { Readable } from "node:stream";
import { JpegDecoder } from "./jpeg";

export class StreamDecoder extends Ffmpeg implements ImageSource {
    private static readonly MAX_AGE_SECONDS = 5;

    private stream: Readable | null = null;

    constructor(
        private readonly broadcast: Broadcast,
        private readonly fps: number,
        private readonly decoder: ImageDecoder = new JpegDecoder(
            fps * StreamDecoder.MAX_AGE_SECONDS,
        ),
    ) {
        super();

        this.register(this.decoder);
    }

    protected override args(): string[] {
        const args: string[] = [];

        args.push("-fflags", "nobuffer");
        args.push("-flags", "low_delay");
        args.push("-probesize", "32");
        args.push("-analyzeduration", "0");
        args.push("-f", this.broadcast.format);
        args.push("-i", "pipe:0");
        args.push("-vf", `fps=${this.fps}`);
        args.push("-f", "image2pipe");
        args.push("-vcodec", this.decoder.vcodec);
        args.push("pipe:1");

        return args;
    }

    public async next(): Promise<ImageFrame | null> {
        return this.decoder.next();
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.child.stdout.on("data", (chunk: Buffer) => {
            this.decoder.ondata(chunk);
        });

        this.stream = this.broadcast.subscribe();
        this.stream.pipe(this.child.stdin);

        const cleanup = () => {
            this.stream?.destroy();
            this.stream = null;
        };

        this.child.stdin.on("close", cleanup);
        this.child.stdin.on("error", cleanup);
    }

    public override toString(): string {
        return `${super.toString()}[StreamDecoder]`;
    }
}
