import { ImageFrame, ImageTask } from "..";
import { signal } from "../../constants";

export class Post implements ImageTask {
    constructor(
        private readonly url: URL,
        private readonly headers: Headers,
    ) {}

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const headers = new Headers(this.headers);
        headers.set("Content-Type", frame.image.contentType);

        const response = await fetch(this.url, {
            method: "POST",
            headers,
            body: new Uint8Array(frame.image.buffer),
            signal,
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return frame;
    }

    public toString(): string {
        return "[Post]";
    }
}
