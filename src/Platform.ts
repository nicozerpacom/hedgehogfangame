import Point, { Rect } from "./Point";
import { HasHitbox } from "./SolidObjects"

export default class Platform implements HasHitbox {

    #hitboxID = Symbol("hitbox")

    constructor(
        public readonly center : Point,
        public readonly dimensions : Point
    ) {}

    static createFromLeftTop(leftTop : Point, dimensions : Point) {
        return new Platform(
            new Point(leftTop.x + dimensions.x / 2, leftTop.y + dimensions.y / 2),
            dimensions
        )
    }

    getPositionleftTop = () : Point => new Point(
        this.center.x - this.dimensions.x / 2,
        this.center.y - this.dimensions.y / 2
    )

    getHitboxID = () : Symbol => this.#hitboxID

    getHitbox = () => Rect.create(
        this.center.x - this.dimensions.x / 2,
        this.center.y - this.dimensions.y / 2,
        this.center.x + this.dimensions.x / 2,
        this.center.y + this.dimensions.y / 2,
    )
    getRect = () => this.getHitbox
}