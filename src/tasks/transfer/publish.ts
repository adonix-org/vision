import { Post } from "./post";

export class Publish extends Post {
    constructor(name: string) {
        const POST_URL_BASE = process.env.LIVEIMAGE_BASE!;
        const BEARER_TOKEN = process.env.LIVEIMAGE_ADMIN_TOKEN!;

        const url = new URL(`live/${encodeURIComponent(name)}`, POST_URL_BASE);
        const headers = new Headers({
            Authorization: `Bearer ${BEARER_TOKEN}`,
        });
        super(url, headers);
    }

    public override toString(): string {
        return `${super.toString()}[Publish]`;
    }
}
