import Character, { CharacterSprite, CharacterSpriteFrame, SpriteType } from "../Character"
import Point from "../Point"
import * as _ from "lodash"


export default function createSonic(): Character {

    const defaultHitbox : [Point, Point] = [new Point(-16, -15), new Point(9, 24)]

    const simpleAnimationMap = (number : number) : CharacterSpriteFrame => (
        {
           width: 48,
           height: 48,
           imageOffset: new Point(0, 48 * number),
           hitbox: defaultHitbox
       }
   )

    const sprites : CharacterSprite[] = [
        {
            type: SpriteType.Idle,
            fileName: "sonicIdle",
            frames: [{
                width: 48,
                height: 48,
                imageOffset: new Point(0, 0),
                hitbox: defaultHitbox
            }]
        },
        {
            type: SpriteType.Walking,
            fileName: "sonicWalking",
            frames:_.range(0, 8).map(simpleAnimationMap)
        },
        {
            type: SpriteType.Running,
            fileName: "sonicRunning",
            frames:_.range(0, 4).map(simpleAnimationMap)
        },
        {
            type: SpriteType.Skidding,
            fileName: "sonicSkidding",
            frames:_.range(0, 3).map(simpleAnimationMap)
        }
    ];


    return new Character({
        acceleration: 0.046875,
        decceleration: 0.5,
        friction: 0.046875,
        topSpeed: 6,
        gravity: 0.21875,
        sprites: sprites
    })
}