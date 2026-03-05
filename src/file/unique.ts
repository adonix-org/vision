import { randomBytes } from "node:crypto";
import { FilePath } from ".";
import path from "node:path";

export class UniqueFile implements FilePath {
    constructor(
        private readonly folder: string,
        private readonly prefix: string = "file",
    ) {}

    protected getTimestamp(): string {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        const ms = String(now.getMilliseconds()).padStart(3, "0");

        return `${yyyy}${mm}${dd}_${hh}${min}${ss}_${ms}`;
    }

    protected getUnique(): string {
        return randomBytes(4).toString("hex");
    }

    protected getPrefix(): string {
        return this.prefix
            .replaceAll(/[^ -~]/g, "_")
            .replaceAll(/[/\\?%*:|"<>]/g, "_")
            .trim();
    }

    public get path(): string {
        return path.join(this.dirname, this.filename);
    }

    public get dirname(): string {
        return this.folder;
    }

    public get filename(): string {
        const timestamp = this.getTimestamp();
        const suffix = this.getUnique();
        const prefix = this.getPrefix();
        return `${prefix}_${timestamp}_${suffix}`;
    }

    public toString(): string {
        return `[UniqueFile]`;
    }
}
