export abstract class Lifecycle {
    protected readonly children: Lifecycle[];
    private transition: Promise<void> | null = null;
    private _running = false;

    constructor(...children: Lifecycle[]) {
        this.children = children;
    }

    public register(child: Lifecycle, ...children: Lifecycle[]): this {
        this.children.push(child, ...children);

        return this;
    }

    public get running(): boolean {
        return this._running;
    }

    public async start(): Promise<void> {
        return this.schedule(async () => {
            if (this.running) return;

            console.info(this.toString(), "starting...");
            await this.onstart();
            this._running = true;
            console.info(this.toString(), "started");
        });
    }

    public async stop(): Promise<void> {
        return this.schedule(async () => {
            if (!this.running) return;

            console.info(this.toString(), "stopping...");
            await this.onstop();
            this._running = false;
            console.info(this.toString(), "stopped");
        });
    }

    protected async onstart(): Promise<void> {
        for (const child of this.children) {
            await child.start();
        }
    }

    protected async onstop(): Promise<void> {
        for (const child of [...this.children].reverse()) {
            await child.stop();
        }
    }

    protected callback<A extends unknown[]>(
        fn: ((...args: A) => void) | undefined,
        ...args: A
    ): void {
        if (!fn) return;
        setImmediate(() => fn(...args));
    }

    private schedule(fn: () => Promise<void>): Promise<void> {
        const run = async () => {
            await fn();
        };

        const promise = this.transition ? this.transition.then(run) : run();

        this.transition = promise.finally(() => {
            if (this.transition === promise) {
                this.transition = null;
            }
        });

        return this.transition;
    }

    public toString(): string {
        return "[Lifecycle]";
    }
}
