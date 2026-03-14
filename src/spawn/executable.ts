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

        this._child.once("exit", this._watch);
        this._child.once("error", this._error);
    }

    public override async stop(): Promise<void> {
        this._child?.removeListener("exit", this._watch);

        await super.stop();
    }

    private readonly _watch = (): void => {
        if (this._child === null) return;

        const code = this._child.exitCode;
        if (code !== null && code != 0) {
            this.oncode(code);
        }

        const signal = this._child.signalCode;
        if (signal !== null) {
            this.onsignal(signal);
        }

        this.stop();
        this._child = null;
    };

    private readonly _error = (err: Error): void => {
        this.onerror(err);
    };

    protected onerror(err: Error): void {
        console.error(this.toString(), err);
    }

    protected oncode(code: number): void {
        const message = `process exited with code ${code}`;
        console.warn(this.toString(), message);
    }

    protected onsignal(signal: NodeJS.Signals): void {
        const message = `process terminated by signal ${signal}`;
        console.warn(this.toString(), message);
    }

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
                }, 3_000);
            }, afterMs);
        });
    }

    public override toString(): string {
        return `${super.toString()}[Executable]`;
    }
}
