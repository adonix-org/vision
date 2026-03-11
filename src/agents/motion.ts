import { Agent } from "./agent";
import { Remote } from "../tasks/remote/remote";
import { PyServer } from "../spawn/pyserver";
import { ViewerTask } from "../tasks/observe/viewer";
import { Label } from "../tasks/draw/label";
import { Trail } from "../tasks/draw/trail";
import { Drawing } from "../tasks/draw";
import { Throttle } from "../tasks/filter/throttle";
import { Record } from "../tasks/transfer/record";
import { PreRoll } from "../targets/preroll";
import { PointFilter } from "../tasks/filter/point";
import { Broadcast } from "../sources/broadcast";
import { StreamDecoder } from "../sources/decoders/stream";
import { ConfidenceFilter } from "../tasks/filter/confidence";
import { Timestamp } from "../tasks/draw/timestamp";

export class Motion extends Agent {
    constructor(broadcast: Broadcast, folder: string, fps: number) {
        const viewer = new ViewerTask("LiveMotion");
        const preroll = new PreRoll(broadcast, 10);

        const animal = new Record(preroll, folder, 10, 15, "animal", true);
        const person = new Record(preroll, folder, 5, 10, "person", true);
        const vehicle = new Record(preroll, folder, 2, 3, "vehicle", true);

        const decoder = new StreamDecoder(broadcast, fps);
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
            new Timestamp(),
        );

        this.addTask(new Throttle(1));
        this.addTask(new Remote("mega"));
        this.addTask(new ConfidenceFilter(0.4));
        this.addTask(new PointFilter(1740, 562, 20, "tree stump"));
        this.addTask(drawing);
        this.addTask(animal);
        this.addTask(person);
        // this.addTask(vehicle);
        this.addTask(viewer);
    }

    public override toString(): string {
        return `${super.toString()}[Motion]`;
    }
}
