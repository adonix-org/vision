import { Executable } from "./executable";

export class PyServer extends Executable {
    constructor() {
        super(`${process.cwd()}/python/.venv/bin/python`);
    }

    protected override async args(): Promise<string[]> {
        return [`${process.cwd()}/python/app/pyserver.py`];
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.child.stdout?.on("data", (data) => {
            const msg = data.toString().trim();
            if (!msg) return;

            console.debug(this.toString(), msg);
        });

        await new Promise<void>((resolve, reject) => {
            if (this.child === null)
                return reject(new Error("Process failed to start"));

            this.child.stdout?.on("data", (data) => {
                const text = data.toString();
                if (text.includes("PyServer ready")) {
                    resolve();
                }
            });
        });
    }

    protected override stderr(): void {
        return;
    }

    public override toString(): string {
        return `${super.toString()}[🐍 \x1b[32mPyServer\x1b[0m]`;
    }
}
