type IMAGE_FRAME_SCHEMA_VERSION = 1;

export interface Annotation {
    readonly category: string;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly confidence?: number;
    readonly model: string;
    active: boolean;
    reason: string;
}

export interface ImageBuffer<T extends Buffer | string = Buffer> {
    contentType: string;
    buffer: T;
}

export interface ImageFrame<T extends Buffer | string = Buffer> {
    image: ImageBuffer<T>;
    readonly timestamp: number;
    readonly version: IMAGE_FRAME_SCHEMA_VERSION;
    readonly annotations: Annotation[];
}

export interface ImageTask {
    process(frame: ImageFrame): Promise<ImageFrame | null>;

    toString(): string;
}

export interface ImageError {
    error: Error;
    source: string;
    timestamp: number;
}

export interface ErrorTask {
    handle(error: ImageError, signal?: AbortSignal): Promise<void>;

    toString(): string;
}
