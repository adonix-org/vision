import { PassThrough, Readable } from "node:stream";
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

        this.child.stdout.on("data", (chunk: Buffer) => {
            for (const subscriber of this.subscribers) {
                subscriber.write(chunk);
            }
        });
    }

    private readonly subscribers: Set<PassThrough> = new Set();

    public subscribe(): Readable {
        const subscriber = new PassThrough({ highWaterMark: 128 * 1024 });

        this.subscribers.add(subscriber);

        const cleanup = () => {
            this.subscribers.delete(subscriber);
            subscriber.removeListener("end", cleanup);
            subscriber.removeListener("close", cleanup);
            subscriber.removeListener("error", cleanup);
        };

        subscriber.on("end", cleanup);
        subscriber.on("close", cleanup);
        subscriber.on("error", cleanup);
        subscriber.resume();

        return subscriber;
    }

    public override toString(): string {
        return `${super.toString()}[Rtsp]`;
    }
}
