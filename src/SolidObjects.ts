import Point, { Rect } from "./Point"
import * as _ from "lodash"

export class SolidObjectFrame {
    constructor(
        public readonly width : number,
        public readonly height : number,
        public readonly imageOffset: Point,
        public readonly hitbox : [Point, Point]
    ) {
    }

    getRect = (position : Point = new Point(0, 0)) : Rect => Rect.create(
        position.x - this.width / 2,
        position.y - this.height / 2,
        position.x - this.width / 2 + this.width,
        position.y - this.height / 2 + this.height
    )
}

export interface HasHitbox {
    getHitbox() : Rect
    getHitboxID() : string
}

export type AllHitboxes = Array<HasHitbox>

export type CheckCollisionInfo = {
    collision : boolean,
    offsetX : number,
    offsetY : number,
    otherItem?: HasHitbox
}

export function checkCollision(thisItem : HasHitbox, otherItem : HasHitbox, offset : Point = new Point(0, 0)) : CheckCollisionInfo {

    const me = thisItem.getHitbox()
    const other = otherItem.getHitbox()

    const output : CheckCollisionInfo = {
        collision: false,
        offsetX: 0,
        offsetY: 0,
        otherItem: null
    }

    if (me.getLeft() + offset.x >= other.getRight() ||
        other.getLeft() >= me.getRight() + offset.x
    ) {
        return output
    }

    if (
        me.getTop() + offset.y >= other.getBottom() ||
        other.getTop() >= me.getBottom() + offset.y
    ) {
        return output
    }

    output.collision = true
    output.otherItem = otherItem

    if (_.inRange(me.getLeft() + offset.x, other.getLeft(), other.getRight())) {
        output.offsetX = (other.getRight() - me.getLeft() + offset.x)
    }
    if (_.inRange(me.getRight() + offset.x, other.getLeft(), other.getRight())) {
        output.offsetX = -(me.getRight() + offset.x - other.getLeft())
    }
    
    if (_.inRange(me.getTop() + offset.y, other.getTop(), other.getBottom())) {
        output.offsetY = (other.getBottom() - me.getTop() + offset.y)
    }
    if (_.inRange(me.getBottom() + offset.y, other.getTop(), other.getBottom())) {
        output.offsetY = -(me.getBottom() + offset.y - other.getTop())
    }

    return output
}