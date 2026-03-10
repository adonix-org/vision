import { Readable } from "node:stream";
import { Executable } from "../spawn/executable";
import { Broadcast } from "../sources/broadcast";

export abstract class Viewer extends Executable {
    private stream: Readable | null = null;

    constructor(protected readonly broadcast: Broadcast) {
        super();
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.stream = this.broadcast.subscribe();
        this.stream.pipe(this.child.stdin);

        const cleanup = () => {
            if (this.stream) {
                this.stream.destroy();
                this.stream = null;
            }
        };

        this.child.stdin.on("close", cleanup);
        this.child.stdin.on("error", cleanup);
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        this.end();

        await this.quit(5_000);
    }

    public override toString(): string {
        return `${super.toString()}[Viewer]`;
    }
}
