import { Executable } from "./executable";

export class PyServer extends Executable {
    protected override executable(): string {
        return `${process.cwd()}/.venv/bin/python`;
    }

    protected override args(): string[] {
        return ["-m", "app.pyserver"];
    }

    protected override cwd(): string {
        return "./python";
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this.child.stdout.on("data", (data) => {
            const msg = data.toString().trim();
            if (!msg) return;

            console.debug(this.toString(), msg);
        });
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        await this.quit();
    }

    public override toString(): string {
        return `${super.toString()}[🐍 \x1b[32mPyServer\x1b[0m]`;
    }
}
