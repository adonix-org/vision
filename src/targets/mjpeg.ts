import { ImageSource } from "../sources";
import { StreamProvider } from "../sources/rtsp";
import { ImageStream } from "../sources/streams/image";
import { Ffmpeg } from "../spawn/ffmpeg";
import { ImageFrame } from "../tasks";
import { BufferedPipe } from "./pipe";

export class MJpeg extends Ffmpeg implements ImageSource {
    private pipe: BufferedPipe | undefined;

    constructor(
        private readonly provider: StreamProvider,
        private readonly imageStream: ImageStream,
        private readonly fps: number,
    ) {
        super();

        this.register(this.imageStream);
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
            this.imageStream.vcodec,
            "pipe:1",
        ];
        return args;
    }

    public async next(): Promise<ImageFrame | null> {
        return this.imageStream.next();
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.pipe = new BufferedPipe(
            this.provider.getStream(),
            this.child.stdin,
        );

        this.child.stdout.on("data", (chunk: Buffer) => {
            this.imageStream.ondata(chunk);
        });

        await this.pipe.start();
    }

    protected override async onstop(): Promise<void> {
        await this.pipe?.end();

        await super.onstop();
    }

    public override toString(): string {
        return `${super.toString()}[mjpeg]`;
    }
}
