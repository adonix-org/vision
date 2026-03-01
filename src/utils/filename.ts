import { randomBytes } from "node:crypto";

export class Filename {
    constructor(
        private readonly directory: string,
        private readonly name: string,
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
        return this.name
            .replaceAll(/[^ -~]/g, "_")
            .replaceAll(/[/\\?%*:|"<>]/g, "_")
            .trim();
    }

    public getFolder(): string {
        return this.directory;
    }

    public getFilename(): string {
        const timestamp = this.getTimestamp();
        const suffix = this.getUnique();
        const prefix = this.getPrefix();
        return `${prefix}_${timestamp}_${suffix}`;
    }

    public toString(): string {
        return `[Filename]`;
    }
}
