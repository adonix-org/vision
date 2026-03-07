import { ImageFrame, ImageTask } from "..";

export type MetaFrame = Readonly<Omit<ImageFrame, "image">>;

export class MetaData implements ImageTask {
    private readonly frames: MetaFrame[] = [];

    public async process(frame: ImageFrame): Promise<ImageFrame | null> {
        const { image, ...meta } = frame;
        this.frames.push(meta);

        return frame;
    }

    public getData(): MetaFrame[] {
        return this.frames;
    }

    public toString(): string {
        return `[MetaData]`;
    }
}
