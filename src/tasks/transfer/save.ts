import path from "node:path";
import { promises as fs } from "node:fs";
import { ImageFrame, ImageTask } from "..";
import { FilePath } from "../../file";

const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp",
};

export class SaveImage implements ImageTask {
    constructor(private readonly file: FilePath) {}

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const folder = this.file.dirname;
        await fs.mkdir(folder, { recursive: true });

        const filename = this.file.filename;
        const ext = mimeToExt[frame.image.contentType] ?? "bin";

        const filepath = path.join(folder, `${filename}.${ext}`);
        const tempfile = path.join(folder, `${filename}.filepart`);

        await fs.writeFile(tempfile, frame.image.buffer);
        await fs.rename(tempfile, filepath);

        return frame;
    }

    public toString(): string {
        return `[Save]`;
    }
}
