import { PassThrough } from "node:stream";

export class Subscribers {
    private static readonly DEFAULT_HIGHWATER = 256 * 1024;

    private readonly subscribers: Set<PassThrough> = new Set();

    constructor(
        private readonly highwater: number = Subscribers.DEFAULT_HIGHWATER,
    ) {}

    public subscribe(): PassThrough {
        const subscriber = new PassThrough({ highWaterMark: this.highwater });

        this.subscribers.add(subscriber);

        const cleanup = () => {
            this.subscribers.delete(subscriber);
        };

        subscriber.once("close", cleanup);
        subscriber.once("error", cleanup);
        subscriber.once("unpipe", cleanup);

        return subscriber;
    }

    public send(chunk: Buffer): void {
        for (const subscriber of this.subscribers) {
            if (!subscriber.writable) continue;

            const free = subscriber.write(chunk);
            if (!free) {
                const overflow =
                    subscriber.writableLength -
                    subscriber.writableHighWaterMark;
                console.warn(
                    this.toString(),
                    `subscriber buffer memory exceeded ${overflow} bytes`,
                );
            }
        }
    }

    public toString(): string {
        return "[Subscribers]";
    }
}
