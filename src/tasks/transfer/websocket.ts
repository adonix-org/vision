import { WebSocketSession } from "../../ws/session";
import { ImageFrame, ImageTask } from "..";

export class WebSocketTask extends WebSocketSession implements ImageTask {
    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        if (!this.running) return frame;

        this.send(frame.image.buffer);

        return frame;
    }
}
