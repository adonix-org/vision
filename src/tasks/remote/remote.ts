import fetch from "node-fetch";
import http from "node:http";
import { ImageTask, ImageFrame } from "..";
import { assertImageFrame, decode, encode } from "./utils";
import { signal } from "../../constants";

const agent = new http.Agent({ keepAlive: true });

export class Remote implements ImageTask {
    private readonly url: URL;

    constructor(path: string, port: number = 8120, host: string = "127.0.0.1") {
        this.url = new URL(path, `http://${host}:${port}`);
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const response = await fetch(this.url, {
            method: "POST",
            body: JSON.stringify(encode(frame)),
            headers: { "Content-Type": "application/json" },
            agent,
            signal,
        });

        if (response.status === 204) return null;

        if (!response.ok) {
            throw new Error(`${response.status} ${await response.text()}`);
        }

        const json: unknown = await response.json();
        return this.onresult(json, frame);
    }

    protected onresult(json: unknown, _frame: ImageFrame): ImageFrame {
        assertImageFrame(json);

        return decode(json);
    }

    public toString(): string {
        return `[Remote: ${this.url}]`;
    }
}
