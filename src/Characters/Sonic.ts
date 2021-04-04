import Character, { CharacterSprite, CharacterSpriteFrame, SpriteType, TileCollisionSensors } from "../Character"
import { AllHitboxes, SolidObjectFrame } from "../SolidObjects"
import Point from "../Point"
import * as _ from "lodash"


export default function createSonic(position : Point, hitboxes ?: AllHitboxes) : Character {

    const defaultHitbox : [Point, Point] = [new Point(-16, -15), new Point(9, 24)]
    const smallHitbox : [Point, Point] = [new Point(-16, 0), new Point(9, 24)]

    const defaultSensors : TileCollisionSensors = {
        leftTop: new Point(-10, -17),
        leftCenter: new Point(-11, 3),
        leftBottom: new Point(-10, 23),
        rightTop: new Point(10, -17),
        rightCenter: new Point(11, 3),
        rightBottom: new Point(10, 23)
    }

    const jumpingSensors : TileCollisionSensors = {
        leftTop: new Point(-8, -7),
        leftCenter: new Point(-11, 8),
        leftBottom: new Point(-8, 23),
        rightTop: new Point(8, -7),
        rightCenter: new Point(11, 8),
        rightBottom: new Point(8, 23)
    }

    const simpleAnimationMap = _.curry((offsetX : number, offsetY : number) : CharacterSpriteFrame => ({
        frame: new SolidObjectFrame(48, 48, new Point(48 * offsetX, 48 * offsetY), defaultHitbox),
        sensors: defaultSensors
    }))

    const sprites : CharacterSprite[] = [
        {
            type: SpriteType.Idle,
            frames: [
                {
                    frame: new SolidObjectFrame(48, 48, new Point(0, 0), defaultHitbox),
                    sensors: defaultSensors
                }
            ]
        },
        {
            type: SpriteType.Walking,
            frames:_.range(0, 8).map(simpleAnimationMap(1))
        },
        {
            type: SpriteType.Running,
            frames: _.range(0, 4).map(simpleAnimationMap(2))
        },
        {
            type: SpriteType.Skidding,
            frames: _.range(0, 3).map(simpleAnimationMap(3))
        },
        {
            type: SpriteType.Jumping,
            frames: [
                { frame: new SolidObjectFrame(48, 48, new Point(192, 0), smallHitbox), sensors: jumpingSensors },
                { frame: new SolidObjectFrame(48, 48, new Point(192, 192), smallHitbox), sensors: jumpingSensors },
                { frame: new SolidObjectFrame(48, 48, new Point(192, 48), smallHitbox), sensors: jumpingSensors },
                { frame: new SolidObjectFrame(48, 48, new Point(192, 192), smallHitbox), sensors: jumpingSensors },
                { frame: new SolidObjectFrame(48, 48, new Point(192, 96), smallHitbox), sensors: jumpingSensors },
                { frame: new SolidObjectFrame(48, 48, new Point(192, 192), smallHitbox), sensors: jumpingSensors },
                { frame: new SolidObjectFrame(48, 48, new Point(192, 144), smallHitbox), sensors: jumpingSensors },
                { frame: new SolidObjectFrame(48, 48, new Point(192, 192), smallHitbox), sensors: jumpingSensors }
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
            jumpSpeed: 6.5,
            spriteImage: "sonic"
        },
        position,
        hitboxes
    )
}