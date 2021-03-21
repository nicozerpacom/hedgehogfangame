type CharacterSettings = {
    acceleration: number,
    decceleration: number,
    friction: number,
    topSpeed: number
}
type Coords = [number, number]

export enum SpriteType {
    Idle = 0,
    Walking,
    Running,
    Breaking
}

export enum MoveType {
    Walk = 0
}

export enum Direction {
    Left = 0,
    Right
}

export default class Character {
    #settings: CharacterSettings
    #position: Coords
    #spriteType: SpriteType
    #direction: Direction
    #currentSpeed: number
    #lastMoveType: MoveType
    #lastMoveDirection: Direction

    constructor(settings: CharacterSettings) {
        this.#settings = settings
        this.#position = [24, 206] //[24, 216]
        this.#currentSpeed = 0
        this.#spriteType = SpriteType.Idle
        this.#direction = Direction.Right
    }

    getPosition() : Coords {
        return this.#position
    }
    getSpriteType() : SpriteType {
        return this.#spriteType
    }
    getDirection() : Direction {
        return this.#direction
    }

    move(moveType ?: MoveType, direction ?: Direction) {
        this.#lastMoveType = moveType
        this.#lastMoveDirection = direction
    }

    updateMovement() {
        let currentSpeed = Math.abs(this.#currentSpeed)
        let nextDirection = this.#lastMoveDirection

        switch (this.#lastMoveType) {
            case MoveType.Walk:

                if (this.#direction != this.#lastMoveDirection) {
                    currentSpeed = currentSpeed - this.#settings.decceleration
                    
                    if (currentSpeed < 0) {
                        currentSpeed = Math.abs(currentSpeed)
                        this.#spriteType = SpriteType.Walking
                    } else {
                        nextDirection = null

                        if (currentSpeed <= this.#settings.topSpeed * 0.50 && this.#spriteType != SpriteType.Breaking) {
                            this.#spriteType = SpriteType.Walking
                        } else {
                            this.#spriteType = SpriteType.Breaking
                            
                        }
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

        
        if (this.#spriteType != SpriteType.Breaking) {
            if (currentSpeed >= this.#settings.topSpeed * 0.75) {
                this.#spriteType = SpriteType.Running
            } else {
                this.#spriteType = SpriteType.Walking
            }
        }

        if (nextDirection == Direction.Left) {
            this.#direction = Direction.Left
        } else if (nextDirection == Direction.Right) {
            this.#direction = Direction.Right
        }

        if (this.#direction == Direction.Left) {
            this.#currentSpeed = -currentSpeed
        } else {
            this.#currentSpeed = currentSpeed
        }

        if (this.#currentSpeed != 0) {
            this.#position = [
                this.#position[0] + this.#currentSpeed,
                this.#position[1]
            ]
        }

        if (this.#currentSpeed == 0) {
            this.#spriteType = SpriteType.Idle
        }
    }
}


