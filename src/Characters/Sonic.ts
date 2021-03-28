import Character, { CharacterSprite, SpriteType } from "../Character"
import { AllHitboxes, SolidObjectFrame } from "../SolidObjects"
import Point from "../Point"
import * as _ from "lodash"


export default function createSonic(position : Point, hitboxes ?: AllHitboxes) : Character {

    const defaultHitbox : [Point, Point] = [new Point(-16, -15), new Point(9, 24)]
    const smallHitbox : [Point, Point] = [new Point(-16, 0), new Point(9, 24)]

    const simpleAnimationMap = _.curry((offsetX : number, offsetY : number) => new SolidObjectFrame(
        48,
        48,
        new Point(48 * offsetX, 48 * offsetY),
        defaultHitbox
   ))

    const sprites : CharacterSprite[] = [
        {
            type: SpriteType.Idle,
            fileName: "sonic",
            frames: [new SolidObjectFrame(48, 48, new Point(0, 0), defaultHitbox)]
        },
        {
            type: SpriteType.Walking,
            fileName: "sonic",
            frames:_.range(0, 8).map(simpleAnimationMap(1))
        },
        {
            type: SpriteType.Running,
            fileName: "sonic",
            frames: _.range(0, 4).map(simpleAnimationMap(2))
        },
        {
            type: SpriteType.Skidding,
            fileName: "sonic",
            frames: _.range(0, 3).map(simpleAnimationMap(3))
        },
        {
            type: SpriteType.Jumping,
            fileName: "sonic",
            frames: [
                new SolidObjectFrame(48, 48, new Point(196, 0), smallHitbox),
                new SolidObjectFrame(48, 48, new Point(196, 192), smallHitbox),
                new SolidObjectFrame(48, 48, new Point(196, 48), smallHitbox),
                new SolidObjectFrame(48, 48, new Point(196, 192), smallHitbox),
                new SolidObjectFrame(48, 48, new Point(196, 96), smallHitbox),
                new SolidObjectFrame(48, 48, new Point(196, 192), smallHitbox),
                new SolidObjectFrame(48, 48, new Point(196, 144), smallHitbox),
                new SolidObjectFrame(48, 48, new Point(196, 192), smallHitbox)
            ]
        }
    ];


    return new Character(
        {
            acceleration: 0.046875,
            decceleration: 0.5,
            friction: 0.046875,
            topSpeed: 6,
            gravity: 0.21875,
            sprites: sprites,
            jumpSpeed: 6.5
        },
        position,
        hitboxes
    )
}