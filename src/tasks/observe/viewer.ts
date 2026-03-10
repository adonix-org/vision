import { PassThrough, Readable } from "node:stream";
import { ImageFrame, ImageTask } from "..";
import { Broadcast, StreamFormat } from "../../sources/broadcast";
import { FfplayViewer } from "../../targets/ffplay";
import { Lifecycle } from "../../lifecycle";

export class ViewerTask extends Lifecycle implements Broadcast, ImageTask {
    private stream = new PassThrough();

    constructor(title?: string) {
        super();

        this.register(new FfplayViewer(this, title));
    }

    public get format(): StreamFormat {
        return "mjpeg";
    }

    public subscribe(): Readable {
        return this.stream;
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        this.stream.write(frame.image.buffer);

        return frame;
    }

    public override toString(): string {
        return "[ViewerTask]";
    }
}
