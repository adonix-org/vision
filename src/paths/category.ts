import path from "node:path";
import { DatePath } from "./date";

export class CategoryPath extends DatePath {
    constructor(
        folder: string,
        private readonly category: string,
        prefix?: string,
    ) {
        super(folder, prefix);
    }

    public override get dirname(): string {
        return path.join(super.dirname, this.category);
    }
}
