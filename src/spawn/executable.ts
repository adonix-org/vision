import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { Lifecycle } from "../lifecycle";

export abstract class Executable extends Lifecycle {
    private _child: ChildProcessWithoutNullStreams | null = null;

    protected abstract executable(): string;

    protected abstract args(): string[];

    protected get child(): ChildProcessWithoutNullStreams {
        if (!this._child) {
            throw new Error(`${this.executable()} is not running.`);
        }
        return this._child;
    }

    protected end(): boolean {
        if (!this._child) return false;

        this._child.stdin.end();
        return true;
    }

    protected override async onstart(): Promise<void> {
        await super.onstart();

        this._child = spawn(this.executable(), this.args(), {
            stdio: ["pipe", "pipe", "pipe"],
        });

        this._child.stderr.resume();
        this._child.stdout.resume();

        this._child.once("exit", this.watch);
    }

    public override async stop(): Promise<void> {
        this._child?.removeListener("exit", this.watch);

        await super.stop();
    }

    private readonly watch = (): void => {
        if (this._child === null) return;

        const code = this._child.signalCode ?? this.child.exitCode;
        const message = `process exited with code ${code}`;
        if (code !== 0) {
            console.warn(this.toString(), message);
        }

        this.stop();
        this._child = null;
    };

    protected async quit(afterMs = 0): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this._child === null || this._child.exitCode !== null) {
                resolve();
                return;
            }

            const child = this._child;

            const cleanup = () => {
                clearTimeout(sigterm);
                clearTimeout(sigkill);
                resolve();
            };

            child.once("exit", cleanup);
            child.once("error", cleanup);

            let sigkill: NodeJS.Timeout;
            const sigterm = setTimeout(() => {
                if (child.exitCode !== null) return;

                console.debug(this.toString(), "sending SIGTERM");
                child.kill("SIGTERM");

                sigkill = setTimeout(() => {
                    if (child.exitCode !== null) return;

                    console.warn(this.toString(), "sending SIGKILL");
                    child.kill("SIGKILL");
                }, 3000);
            }, afterMs);
        });
    }

    public override toString(): string {
        return `${super.toString()}[Executable]`;
    }
}
