import { ImageSource } from "..";
import { StreamProvider } from "../rtsp";
import { ImageDecoder } from "./image";
import { Ffmpeg } from "../../spawn/ffmpeg";
import { ImageFrame } from "../../tasks";
import { BufferedPipe } from "../../targets/pipe";

export class StreamDecoder extends Ffmpeg implements ImageSource {
    private pipe: BufferedPipe | undefined;

    constructor(
        private readonly provider: StreamProvider,
        private readonly decoder: ImageDecoder,
        private readonly fps: number,
    ) {
        super();

        this.register(this.decoder);
    }

    protected override args(): string[] {
        const args = [
            "-loglevel",
            "fatal",
            "-f",
            "mpegts",
            "-i",
            "pipe:0",
            "-vf",
            `fps=${this.fps}`,
            "-f",
            "image2pipe",
            "-vcodec",
            this.decoder.vcodec,
            "pipe:1",
        ];
        return args;
    }

    public async next(): Promise<ImageFrame | null> {
        return this.decoder.next();
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.pipe = new BufferedPipe(
            this.provider.getStream(),
            this.child.stdin,
        );

        this.child.stdout.on("data", (chunk: Buffer) => {
            this.decoder.ondata(chunk);
        });

        await this.pipe.start();
    }

    protected override async onstop(): Promise<void> {
        await this.pipe?.end();

        await super.onstop();
    }

    public override toString(): string {
        return `${super.toString()}[StreamDecoder]`;
    }
}
