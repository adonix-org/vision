import { Agent } from "./agent";
import { Remote } from "../tasks/remote/remote";
import { PyServer } from "../spawn/pyserver";
import { ImageViewer } from "../tasks/observe/image";
import { Label } from "../tasks/draw/label";
import { Trail } from "../tasks/draw/trail";
import { Watermark } from "../tasks/draw/watermark";
import { Drawing } from "../tasks/draw";
import { Throttle } from "../tasks/filter/throttle";
import { Record } from "../tasks/transfer/record";
import { PreRoll } from "../targets/preroll";
import { CenterPointFilter } from "../tasks/filter/centerpoint";
import { Broadcast } from "../sources/broadcast";
import { StreamDecoder } from "../sources/decoders/stream";
import { LiveDecoder } from "../sources/decoders/live";
import { ConfidenceFilter } from "../tasks/filter/confidence";
import { Ignore } from "../tasks/filter/ignore";

export class Motion extends Agent {
    constructor(broadcast: Broadcast, folder: string, fps: number) {
        const viewer = new ImageViewer("LiveMotion");
        const long = new PreRoll(broadcast, 10.5);
        const short = new PreRoll(broadcast, 3);

        const animal = new Record(long, folder, 10.5, "animal");
        const person = new Record(long, folder, 5, "person");
        const vehicle = new Record(short, folder, 2.5, "vehicle");

        const decoder = new StreamDecoder(broadcast, new LiveDecoder(15), fps);
        super(decoder);

        this.register(new PyServer());
        this.register(short);
        this.register(long);
        this.register(viewer);
        this.register(animal);
        this.register(person);
        this.register(vehicle);

        const drawing = new Drawing(
            new Label("yellow", 36, "red"),
            new Trail(),
            new Watermark("LiveMotion"),
        );

        this.addTask(new Throttle(fps));
        this.addTask(new Remote("mega"));
        this.addTask(new ConfidenceFilter(0.4));
        this.addTask(new Ignore("vehicle"));
        this.addTask(new CenterPointFilter(1740, 562, 20));
        this.addTask(drawing);
        this.addTask(viewer);
        this.addTask(animal);
        this.addTask(person);
        this.addTask(vehicle);
    }

    public override toString(): string {
        return `${super.toString()}[Motion]`;
    }
}
