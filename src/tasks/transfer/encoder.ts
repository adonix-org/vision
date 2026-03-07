import { ImageFrame, ImageTask } from "..";
import { Encoder } from "../../targets/encoder";

export class EncoderTask extends Encoder implements ImageTask {
    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        this.child.stdin.write(frame.image.buffer);

        return frame;
    }
}
