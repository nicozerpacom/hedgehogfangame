import Point, { Rect } from "./Point"
import { SolidObjectFrame, HasHitbox, AllHitboxes, checkCollision, CheckCollisionInfo } from "./SolidObjects"
import Speed from "./Speed"
import * as _ from "lodash"
import Platform from "./Platform"

type CharacterSettings = {
    acceleration: number,
    decceleration: number,
    friction: number,
    topSpeed: number
    gravity: number,
    jumpSpeed : number,
    spriteImage: string,
    sprites: CharacterSprite[]
}

export enum SpriteType {
    Idle = 0,
    Walking,
    Running,
    Skidding,
    Jumping
}

export enum MoveType {
    None = 0,
    Walk,
    Skid,
    Jump,
    JumpPassive
}

export enum DirectionX {
    Left = 0,
    Right
}
export enum DirectionY {
    Top = 0,
    Bottom
}

export type CharacterSprite = {
    type : SpriteType,
    frames: CharacterSpriteFrame[]
}
export type CharacterSpriteFrame = {
    frame: SolidObjectFrame,
    sensors: TileCollisionSensors
}

export type TileCollisionSensors = {
    leftTop: Point,
    leftCenter: Point,
    leftBottom: Point,
    rightTop: Point,
    rightCenter: Point,
    rightBottom: Point
}

export default class Character implements HasHitbox {
    #settings : CharacterSettings
    #position : Point
    #spriteType : SpriteType
    #direction : DirectionX
    #currentSpeedX : Speed
    #currentSpeedY : Speed
    #lastMovesTypes : Array<[MoveType, DirectionX]>
    #spriteFrameIndex : number
    #nextSpriteCounter : number
    #isJumping : boolean = false

    #hitboxID = Symbol("hitbox")

    constructor(
        settings: CharacterSettings,
        position : Point,
        protected hitboxes : AllHitboxes = [],
        protected platforms : Platform[]
    ) {
        this.#settings = settings
        this.#position = position
        this.#currentSpeedX = new Speed()
        this.#currentSpeedY = new Speed()
        this.#spriteType = SpriteType.Idle
        this.#direction = DirectionX.Right
        this.#nextSpriteCounter = 0
        this.#spriteFrameIndex = 0
    }

    getHitboxID = () : Symbol => this.#hitboxID

    getHitbox() : Rect {

        let indexA = 0
        let indexB = 1

        if (this.#direction == DirectionX.Left) {
            indexA = 1
            indexB = 0
        }

        return Rect.create(
            this.#position.x - Math.abs(this.getSpriteFrame().hitbox[indexA].x),
            this.#position.y - Math.abs(this.getSpriteFrame().hitbox[0].y),
            this.#position.x + Math.abs(this.getSpriteFrame().hitbox[indexB].x),
            this.#position.y + Math.abs(this.getSpriteFrame().hitbox[1].y)
        )
    }

    getPosition() : Point {
        return this.#position
    }
    getSpriteType() : SpriteType {
        return this.#spriteType
    }
    getDirection() : DirectionX {
        return this.#direction
    }

    move(moveTypes : Array<[MoveType, DirectionX]>) {
        this.#lastMovesTypes = moveTypes
    }

    private getNextFrame(animationDuration : number) : void {
        if (this.#nextSpriteCounter == 0) {
            this.#nextSpriteCounter = animationDuration
            
            this.#spriteFrameIndex++

            if (this.#spriteFrameIndex >= this.getSprite().frames.length) {
                this.#spriteFrameIndex = 0
            }
        } else {
            this.#nextSpriteCounter--
        }
    }

    getSpriteImage() : string {
        return this.#settings.spriteImage
    }

    private updateSprite() : void {
        const currentSpeedX = this.#currentSpeedX.getAbsolute()
        const previousSpeedX = this.#currentSpeedX.getPreviousAbsolute()

        const currentSpeedY = this.#currentSpeedY.getAbsolute()

        const isAcceleratingX = currentSpeedX > previousSpeedX

        const oldSpriteType = this.#spriteType

        const moveTypesOnly = this.#lastMovesTypes.map((item) : MoveType => item[0])

        if (_.intersection(moveTypesOnly, [MoveType.JumpPassive, MoveType.Jump]).length > 0) {
            this.#spriteType = SpriteType.Jumping
        } else if (currentSpeedX > 0 && this.#spriteType != SpriteType.Jumping) {

            if (moveTypesOnly.includes(MoveType.Skid)) {
                this.#spriteType = SpriteType.Skidding
            } else if (
                (isAcceleratingX && currentSpeedX < this.#settings.topSpeed) ||
                (!isAcceleratingX && currentSpeedX < this.#settings.topSpeed * 0.80)
            ) {
                this.#spriteType = SpriteType.Walking
            } else {
                this.#spriteType = SpriteType.Running
            }
        }

        if (this.#spriteType != oldSpriteType) {
            this.#spriteFrameIndex = 0
            this.#nextSpriteCounter = 0
        }


        if (this.#spriteType == SpriteType.Jumping && currentSpeedY != 0) {
            const animationDuration = 4
            this.getNextFrame(animationDuration)

        } else {

            if (this.#spriteType == SpriteType.Jumping) {
                this.#spriteType = SpriteType.Walking
            }

            if (currentSpeedX > 0) {
                const animationDuration = Math.floor(Math.max(0, 8 - currentSpeedX))
                this.getNextFrame(animationDuration)
            }

            if (currentSpeedX == 0) {
                this.#spriteType = SpriteType.Idle
                this.#spriteFrameIndex = 0
            }
        }
    }

    getSpriteFrameIndex() : number {
        return this.#spriteFrameIndex
    }

    updateMovement() {
        const oldPosition = new Point(this.#position.x, this.#position.y)
        let currentSpeedX = Math.abs(this.#currentSpeedX.getAbsolute())

        let nextDirection = null

        const lastMovementWithDirection = _.findLast(this.#lastMovesTypes, item => item[1] !== null)
        if (lastMovementWithDirection) {
            nextDirection = lastMovementWithDirection[1]
        }
        
        let alreadyMoved = false

        const moveTypesOnly = this.#lastMovesTypes.map((item) : MoveType => item[0])

        if (moveTypesOnly.includes(MoveType.Jump)) {
            if (!this.#isJumping) {
                this.#currentSpeedY.set(this.#currentSpeedY.get() - this.#settings.jumpSpeed)
                this.#isJumping = true
            }
            alreadyMoved = true
        }

        if (_.intersection(moveTypesOnly, [MoveType.Walk, MoveType.Skid]).length > 0) {
            if (this.#direction != nextDirection) {
                currentSpeedX = currentSpeedX - this.#settings.decceleration
                
                if (currentSpeedX < 0) {
                    currentSpeedX = Math.abs(currentSpeedX)
                    this.#lastMovesTypes = [[MoveType.Walk, nextDirection]]
                } else {
                    nextDirection = null
                    this.#lastMovesTypes = [[MoveType.Skid, nextDirection]]
                }
            } else {
                currentSpeedX = Math.min(
                    currentSpeedX + this.#settings.acceleration,
                    this.#settings.topSpeed
                )
            }

            alreadyMoved = true
        }

        if (!alreadyMoved) {
            if (this.#isJumping) {
                this.#currentSpeedY.set(Math.max(-4, this.#currentSpeedY.get()))
            }
            currentSpeedX = Math.max(0, currentSpeedX - this.#settings.friction)
        }

        if (nextDirection == DirectionX.Left) {
            this.#direction = DirectionX.Left
        } else if (nextDirection == DirectionX.Right) {
            this.#direction = DirectionX.Right
        }

        if (this.#direction == DirectionX.Left) {
            this.#currentSpeedX.set(-currentSpeedX)
        } else {
            this.#currentSpeedX.set(currentSpeedX)
        }

        if (this.#currentSpeedX.get() != 0) {
            this.#position.set(
                this.#position.x + this.#currentSpeedX.get(),
                this.#position.y
            )
        }

        
        this.#currentSpeedY.set(this.#currentSpeedY.get() + this.#settings.gravity)

        this.#position.set(
            this.#position.x,
            this.#position.y + this.#currentSpeedY.get()
        )
        
        this.findCollisions(
            this.#position.x >= oldPosition.x ? DirectionX.Right : DirectionX.Left,
            this.#position.y >= oldPosition.y ? DirectionY.Bottom : DirectionY.Top
        ).forEach((collision) => {
            this.#position.set(
                this.#position.x + collision.offsetX,
                this.#position.y + collision.offsetY
            )

            if (collision.offsetX != 0) {
                this.#currentSpeedX.set(0)
            }
            if (collision.offsetY != 0) {
                this.#currentSpeedY.set(0)
            }

            if (this.#isJumping) {
                this.#isJumping = false
            }
        })

        this.updateSprite()
    }

    getSprite() : CharacterSprite {
        return this.#settings.sprites.find(
            (item : CharacterSprite) : boolean => item.type == this.#spriteType
        )
    }
    getSpriteFrame() : SolidObjectFrame {
        return this.getSprite().frames[this.getSpriteFrameIndex()].frame
    }
    getSpriteSensors() : TileCollisionSensors {
        const baseSensors = this.getSprite().frames[this.getSpriteFrameIndex()].sensors
        return {
            leftTop: new Point(
                this.#position.x + baseSensors.leftTop.x,
                this.#position.y + baseSensors.leftTop.y
            ),
            leftCenter: new Point(
                this.#position.x + baseSensors.leftCenter.x,
                this.#position.y + baseSensors.leftCenter.y
            ),
            leftBottom: new Point(
                this.#position.x + baseSensors.leftBottom.x,
                this.#position.y + baseSensors.leftBottom.y
            ),
            rightTop: new Point(
                this.#position.x + baseSensors.rightTop.x,
                this.#position.y + baseSensors.rightTop.y
            ),
            rightCenter: new Point(
                this.#position.x + baseSensors.rightCenter.x,
                this.#position.y + baseSensors.rightCenter.y
            ),
            rightBottom: new Point(
                this.#position.x + baseSensors.rightTop.x,
                this.#position.y + baseSensors.rightBottom.y
            )
        }
    }

    findCollisions(directionX : DirectionX = DirectionX.Right, directionY : DirectionY = DirectionY.Bottom, offset ?: Point) : CheckCollisionInfo[] {

        const output : CheckCollisionInfo[] = []

        const sensors = this.getSpriteSensors()

        let sensorTypes : string[]

        if (directionX == DirectionX.Right) {
            if (directionY == DirectionY.Bottom) {
                sensorTypes = [
                    "rightBottom", "rightCenter", "rightTop",
                    "leftBottom", "leftCenter", "leftTop"
                ]
            } else {
                sensorTypes = [
                    "rightTop", "rightCenter", "rightBottom",
                    "leftTop", "leftCenter", "rightTop"
                ]
            }
        } else {
            if (directionY == DirectionY.Bottom) {
                sensorTypes = [
                    "leftBottom", "leftCenter", "leftTop",
                    "rightBottom", "rightCenter", "rightTop"
                ]
            } else {
                sensorTypes = [
                    "rightBottom", "rightCenter", "rightTop",
                    "leftBottom", "leftCenter", "leftTop"
                ]
            }
        }

        ["x", "y"].forEach(dimension => {
            this.platforms.forEach((platform : Platform) => {

                const otherDimension = dimension == "x" ? "y" : "x"
                
                sensorTypes.forEach(sensorType => {
                    const sensor : Point = sensors[sensorType]
                    let posList : number[]
                    
                    if (dimension == "x") {
                        posList = platform.getPosXFromY(sensor[otherDimension])
                    } else {
                        posList = platform.getPosYFromX(sensor[otherDimension])
                    }

                    const platformPosGroup = posList.reduce((aggregate : number[][], item : number) :  number[][] => {
                            if (aggregate.length == 0) {
                                aggregate.push([item])
                            } else {
                                const lastGroup = aggregate[aggregate.length - 1]
                                if (lastGroup.length == 2) {
                                    aggregate.push([item])
                                } else {
                                    lastGroup.push(item)
                                }
                            }
                            return aggregate
                        }, [] as  number[][])

                    platformPosGroup.forEach(posGroup => {
                        if (sensor[dimension] >= posGroup[0] - 1 && sensor[dimension] <= posGroup[1] + 1) {
                            let offsets = {
                                "x": 0,
                                "y": 0
                            }

                            if (directionY == DirectionY.Bottom) {
                                offsets[dimension] = posGroup[0] - sensor[dimension] - 1
                            } else {
                                offsets[dimension] = posGroup[1] - sensor[dimension] + 1
                            }

                            output.push({
                                collision: true,
                                offsetX: offsets.x,
                                offsetY: offsets.y
                            })
                        }
                    })
                })
            })
        })


        

        return output


        /*return this.hitboxes
            .filter(item => item.getHitboxID() != this.getHitboxID())
            .map(item => checkCollision(this, item, offset))
            .filter(item => item.collision)*/
    }
}


