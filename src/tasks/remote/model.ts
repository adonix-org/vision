import { ImageFrame } from "..";
import { Remote } from "./remote";
import { assertAnnotations } from "./utils";

export class Model extends Remote {
    protected override onresult(json: unknown, frame: ImageFrame): ImageFrame {
        assertAnnotations(json);

        return {
            ...frame,
            annotations: json,
        };
    }

    public override toString(): string {
        return `${super.toString()}[Model]`;
    }
}
