import path from "node:path";
import { promises as fs } from "node:fs";
import { ImageFrame, ImageTask } from "..";
import { UniqueFile } from "../../utils/unique";

const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp",
};

export class Save implements ImageTask {
    private readonly file: UniqueFile;

    constructor(folder: string, name: string = "image") {
        this.file = new UniqueFile(folder, name);
    }

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const folder = await this.file.getFolder();
        await fs.mkdir(folder, { recursive: true });

        const filename = await this.file.getFilename();
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
