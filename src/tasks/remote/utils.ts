import { Annotation, ImageFrame } from "..";

export function decode(frame: ImageFrame<string>): ImageFrame {
    return {
        ...frame,
        image: {
            buffer: Buffer.from(frame.image.buffer, "base64"),
            contentType: frame.image.contentType,
        },
    };
}

export function encode(frame: ImageFrame): ImageFrame<string> {
    return {
        ...frame,
        image: {
            contentType: frame.image.contentType,
            buffer: frame.image.buffer.toString("base64"),
        },
    };
}

export function assertAnnotations(
    value: unknown,
): asserts value is Annotation[] {
    if (!Array.isArray(value)) {
        throw new TypeError("Invalid JSON response: not an array");
    }

    for (const item of value) {
        if (typeof item !== "object" || item === null) {
            throw new TypeError("Invalid JSON response: annotation not object");
        }

        const obj = item as Record<string, unknown>;

        if (
            typeof obj.category !== "string" ||
            typeof obj.x !== "number" ||
            typeof obj.y !== "number" ||
            typeof obj.width !== "number" ||
            typeof obj.height !== "number" ||
            typeof obj.confidence !== "number" ||
            typeof obj.model !== "string"
        ) {
            throw new TypeError("Invalid JSON response: malformed annotation");
        }

        if (obj.active !== undefined && typeof obj.active !== "boolean") {
            throw new TypeError("Invalid JSON response: invalid active flag");
        }

        if (obj.reason !== undefined && typeof obj.reason !== "string") {
            throw new TypeError("Invalid JSON response: invalid reason");
        }
    }
}

export function assertImageFrame(
    value: unknown,
): asserts value is ImageFrame<string> {
    if (typeof value !== "object" || value === null) {
        throw new TypeError("Invalid JSON response: not an object");
    }

    const obj = value as Record<string, unknown>;

    if (
        typeof obj.version !== "number" ||
        typeof obj.image !== "object" ||
        obj.image === null
    ) {
        throw new TypeError("Invalid JSON response: missing image or version");
    }

    const img = obj.image as Record<string, unknown>;

    if (typeof img.buffer !== "string" || typeof img.contentType !== "string") {
        throw new TypeError("Invalid JSON response: bad image");
    }

    assertAnnotations(obj.annotations);
}
