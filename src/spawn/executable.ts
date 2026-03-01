import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { Lifecycle } from "../lifecycle";

export abstract class Executable extends Lifecycle {
    private _child: ChildProcessWithoutNullStreams | null = null;

    protected abstract executable(): string;

    protected abstract args(): string[];

    protected get child(): ChildProcessWithoutNullStreams {
        if (!this._child) {
            throw new Error(`${this.executable} is not running.`);
        }
        return this._child;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this._child = spawn(this.executable(), this.args());

        this._child.stderr.on("data", (buffer: Buffer) => {
            this.stderr(buffer);
        });

        this._child.once("exit", async () => {
            this._child = null;
        });
    }

    protected stderr(buffer: Buffer): void {
        console.error(buffer.toString());
    }

    protected override async onstop(): Promise<void> {
        await super.onstop();

        if (!this._child || this._child.killed) return;

        await new Promise<void>((resolve) => {
            const child = this._child!;

            const cleanup = () => {
                clearTimeout(forceTimer);
                resolve();
            };

            child.once("exit", cleanup);
            child.once("error", cleanup);
            child.kill();

            const forceTimer = setTimeout(() => {
                if (!child.killed) {
                    console.warn(this.toString(), "terminating...");
                    child.kill("SIGKILL");
                }
            }, 5000);
        });
    }

    public override toString(): string {
        return `[Executable]`;
    }
}
