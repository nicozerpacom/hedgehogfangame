import Point from "./Point"
import Speed from "./Speed"

type CharacterSettings = {
    acceleration: number,
    decceleration: number,
    friction: number,
    topSpeed: number
    gravity: number,
    sprites: CharacterSprite[]
}

export enum SpriteType {
    Idle = 0,
    Walking,
    Running,
    Skidding
}

export enum MoveType {
    Walk = 0,
    Skid
}

export enum Direction {
    Left = 0,
    Right
}

export type CharacterSprite = {
    type : SpriteType,
    fileName: string,
    frames: CharacterSpriteFrame[]
}
export type CharacterSpriteFrame = {
    width: number,
    height: number,
    imageOffset: Point,
    hitbox: [Point, Point]
}

export default class Character {
    #settings : CharacterSettings
    #position : Point
    #spriteType : SpriteType
    #direction : Direction
    #currentSpeed : Speed
    #lastMoveType : MoveType
    #lastMoveDirection : Direction
    
    #nextSpriteCounter : number
    #shouldChangeSprite : boolean

    constructor(settings: CharacterSettings) {
        this.#settings = settings
        this.#position = new Point(24, 200) //[24, 216]
        this.#currentSpeed = new Speed()
        this.#spriteType = SpriteType.Idle
        this.#direction = Direction.Right
        this.#nextSpriteCounter = 0
        this.#shouldChangeSprite = false
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
    
    getShouldChangeSprite() : boolean {
        return this.#shouldChangeSprite
    }

    move(moveType ?: MoveType, direction ?: Direction) {
        this.#lastMoveType = moveType
        this.#lastMoveDirection = direction
    }

    private updateSprite() : void {
        const currentSpeed = this.#currentSpeed.getAbsolute()
        const previousSpeed = this.#currentSpeed.getPreviousAbsolute()

        const isAccelerating = currentSpeed > previousSpeed

        if (currentSpeed > 0) {

            if (this.#lastMoveType == MoveType.Skid) {
                this.#spriteType = SpriteType.Skidding
            } else if (
                (isAccelerating && currentSpeed < this.#settings.topSpeed) ||
                (!isAccelerating && currentSpeed < this.#settings.topSpeed * 0.80)
            ) {
                this.#spriteType = SpriteType.Walking
            } else {
                this.#spriteType = SpriteType.Running
            }
        }


        if (currentSpeed > 0) {
            const animationDuration = Math.floor(Math.max(0, 8 - currentSpeed))
            
            if (this.#nextSpriteCounter == 0) {
                this.#nextSpriteCounter = animationDuration
                this.#shouldChangeSprite = true
            } else {
                this.#nextSpriteCounter--
                this.#shouldChangeSprite = false
            }
        }

        if (currentSpeed == 0) {
            this.#spriteType = SpriteType.Idle
        }
    }

    updateMovement() {
        let currentSpeed = Math.abs(this.#currentSpeed.getAbsolute())
        let nextDirection = this.#lastMoveDirection

        switch (this.#lastMoveType) {
            case MoveType.Walk:
            case MoveType.Skid:

                if (this.#direction != this.#lastMoveDirection) {
                    currentSpeed = currentSpeed - this.#settings.decceleration
                    
                    if (currentSpeed < 0) {
                        currentSpeed = Math.abs(currentSpeed)
                        this.#lastMoveType = MoveType.Walk
                    } else {
                        nextDirection = null
                        this.#lastMoveType = MoveType.Skid
                    }
                } else {
                    currentSpeed = Math.min(
                        currentSpeed + this.#settings.acceleration,
                        this.#settings.topSpeed
                    )
                }
                break

            default:
                currentSpeed = Math.max(
                    0,
                    currentSpeed - this.#settings.friction
                )
        }

        if (nextDirection == Direction.Left) {
            this.#direction = Direction.Left
        } else if (nextDirection == Direction.Right) {
            this.#direction = Direction.Right
        }

        if (this.#direction == Direction.Left) {
            this.#currentSpeed.set(-currentSpeed)
        } else {
            this.#currentSpeed.set(currentSpeed)
        }

        if (this.#currentSpeed.get() != 0) {
            this.#position.set(
                this.#position.x + this.#currentSpeed.get(),
                this.#position.y
            )
        }

        this.updateSprite()
    }

    getSprite() : CharacterSprite {
        return this.#settings.sprites.find(
            (item : CharacterSprite) : boolean => item.type == this.#spriteType
        )
    }
}


