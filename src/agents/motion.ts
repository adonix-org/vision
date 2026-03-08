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
import { PointFilter } from "../tasks/filter/point";
import { Broadcast } from "../sources/broadcast";
import { StreamDecoder } from "../sources/decoders/stream";
import { LiveDecoder } from "../sources/decoders/live";
import { ConfidenceFilter } from "../tasks/filter/confidence";
import { Ignore } from "../tasks/filter/ignore";

export class Motion extends Agent {
    constructor(broadcast: Broadcast, folder: string, fps: number) {
        const viewer = new ImageViewer("LiveMotion");
        const preroll = new PreRoll(broadcast, 15);

        const animal = new Record(preroll, folder, 10, 10, "animal");
        const person = new Record(preroll, folder, 5, 5, "person");
        const vehicle = new Record(preroll, folder, 3, 3, "vehicle");

        const decoder = new StreamDecoder(broadcast, new LiveDecoder(15), fps);
        super(decoder);

        this.register(new PyServer());
        this.register(preroll);
        this.register(viewer);
        this.register(animal);
        this.register(person);
        this.register(vehicle);

        const drawing = new Drawing(
            new Label("yellow", 36, "red"),
            new Trail(),
            new Watermark("LiveMotion"),
        );

        this.addTask(new Throttle(1));
        this.addTask(new Remote("mega"));
        this.addTask(new ConfidenceFilter(0.35));
        this.addTask(new Ignore("vehicle"));
        this.addTask(new PointFilter(1740, 562, 20, "tree stump"));
        this.addTask(drawing);
        this.addTask(animal);
        this.addTask(person);
        this.addTask(vehicle);
        this.addTask(viewer);
    }

    public override toString(): string {
        return `${super.toString()}[Motion]`;
    }
}
