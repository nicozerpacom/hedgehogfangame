import Character from "../Character"

export default function createSonic(): Character {
    return new Character({
        acceleration: 0.046875,
        decceleration: 0.5,
        friction: 0.046875,
        topSpeed: 6
    })
}