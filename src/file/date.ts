import path from "node:path";
import { UniqueFile } from "./unique";

export class DatePath extends UniqueFile {
    public override get dirname(): string {
        const date = new Date();
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return path.join(super.dirname, `${y}-${m}-${d}`);
    }

    public override toString(): string {
        return `${super.toString()}[DatePath]`;
    }
}
