import WebSocket from "ws";
import { WebSocketSession } from "../../ws/session";
import { ImageFrame, ImageTask } from "..";

export class WebSocketTask extends WebSocketSession implements ImageTask {
    protected override async onmessage(
        data: WebSocket.RawData,
        isBinary: boolean,
    ): Promise<void> {
        console.log(data, isBinary);
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        this.send(frame.image.buffer);

        return frame;
    }
}
