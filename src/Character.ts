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

export enum Direction {
    Left = 0,
    Right
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
    #direction : Direction
    #currentSpeedX : Speed
    #currentSpeedY : Speed
    #lastMovesTypes : Array<[MoveType, Direction]>
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
        this.#direction = Direction.Right
        this.#nextSpriteCounter = 0
        this.#spriteFrameIndex = 0
    }

    getHitboxID = () : Symbol => this.#hitboxID

    getHitbox() : Rect {

        let indexA = 0
        let indexB = 1

        if (this.#direction == Direction.Left) {
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
    getDirection() : Direction {
        return this.#direction
    }

    move(moveTypes : Array<[MoveType, Direction]>) {
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

        if (nextDirection == Direction.Left) {
            this.#direction = Direction.Left
        } else if (nextDirection == Direction.Right) {
            this.#direction = Direction.Right
        }

        if (this.#direction == Direction.Left) {
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
        
        const collisionsY = this
            .findCollisions()
            .filter(item => item.offsetY != 0)

        if (collisionsY.length > 0) {
            this.#position.set(
                this.#position.x,
                this.#position.y - Math.abs(collisionsY[0].offsetY)
            )
            this.#currentSpeedY.set(0)

            if (this.#isJumping) {
                this.#isJumping = false
            }
        }

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

    findCollisions(offset ?: Point) : CheckCollisionInfo[] {

        const output : CheckCollisionInfo[] = []

        const sensors = this.getSpriteSensors()

        this.platforms.forEach((platform : Platform) => {
            
            let bottomCollision : CheckCollisionInfo
            const posLeftBottoms = platform.getPosYFromX(sensors.leftBottom.x)
            if (posLeftBottoms.length > 0) {
                const platformLeftBottom = posLeftBottoms[0]

                if (sensors.leftBottom.y >= platformLeftBottom) {
                    bottomCollision = {
                        collision: true,
                        offsetX: 0,
                        offsetY: platformLeftBottom - sensors.leftBottom.y
                    }
                }
            }

            const posRightBottoms = platform.getPosYFromX(sensors.rightBottom.x)
            if (posRightBottoms.length > 0) {
                const platformRightBottom = posRightBottoms[0]

                if (sensors.leftBottom.y >= platformRightBottom) {

                    if (
                        !bottomCollision
                        || bottomCollision && Math.abs(bottomCollision.offsetY) < Math.abs(platformRightBottom - sensors.rightBottom.y)
                    ) {
                        bottomCollision = {
                            collision: true,
                            offsetX: 0,
                            offsetY: platformRightBottom - sensors.rightBottom.y
                        }
                    }
                }
            }

            if (bottomCollision) output.push(bottomCollision)
        })

        return output


        /*return this.hitboxes
            .filter(item => item.getHitboxID() != this.getHitboxID())
            .map(item => checkCollision(this, item, offset))
            .filter(item => item.collision)*/
    }
}


