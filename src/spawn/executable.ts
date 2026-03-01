import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { Lifecycle } from "../lifecycle";

export abstract class Executable extends Lifecycle {
    private _child: ChildProcessWithoutNullStreams | null = null;

    constructor(private readonly path: string) {
        super();
    }

    protected abstract args(): Promise<string[]>;

    protected get child(): ChildProcessWithoutNullStreams {
        if (!this._child) {
            throw new Error(`${this.path} is not running.`);
        }
        return this._child;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this._child = spawn(this.path, await this.args());

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

        await new Promise<void>((resolve) => {
            if (this._child === null || this._child.killed) {
                resolve();
                return;
            }

            const cleanup = () => resolve();
            this._child.once("exit", cleanup);
            this._child.once("error", cleanup);
            this._child.kill();
        });
    }

    public override toString(): string {
        return `[Executable]`;
    }
}
