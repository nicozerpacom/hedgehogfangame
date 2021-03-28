import Point, { Rect } from "./Point";
import { HasHitbox } from "./SolidObjects"

export default class Platform implements HasHitbox {

    #hitboxID = `platform${Math.round(Math.random() * 100000)}`

    constructor(
        public readonly position : Point,
        public readonly rect : Rect,
        public readonly hitbox : Rect
    ) {}

    getPositionleftTop = () : Point => new Point(
        this.position.x - this.rect.getWidth() / 2,
        this.position.y - this.rect.getHeight() / 2
    )

    getHitboxID = () : string => this.#hitboxID

    getHitbox() : Rect {
        return Rect.create(
            this.position.x - Math.abs(this.hitbox.getLeft()),
            this.position.y - Math.abs(this.hitbox.getTop()),
            this.position.x + Math.abs(this.hitbox.getRight()),
            this.position.y + Math.abs(this.hitbox.getBottom())
        )
    }
    getRect() : Rect {
        return Rect.create(
            this.position.x - Math.abs(this.rect.getLeft()),
            this.position.y - Math.abs(this.rect.getTop()),
            this.position.x + Math.abs(this.rect.getRight()),
            this.position.y + Math.abs(this.rect.getBottom())
        )
    }
}