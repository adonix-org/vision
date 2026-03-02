import { Broadcast } from "../../sources/broadcast";
import { Executable } from "../../spawn/executable";
import { ImageFrame, ImageTask } from "../../tasks";
import { BufferedPipe } from "../pipe";

export abstract class Viewer extends Executable implements ImageTask {
    private pipe: BufferedPipe | undefined;

    constructor(private readonly broadcast: Broadcast) {
        super();
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.pipe = new BufferedPipe(
            this.broadcast.getReadable(),
            this.child.stdin,
        );

        await this.pipe.start();
    }

    protected override async onstop(): Promise<void> {
        await this.pipe?.stop();

        await super.onstop();
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        if (!this.running) return frame;

        return frame;
    }

    public override toString(): string {
        return `${super.toString()}[Viewer]`;
    }
}
