import createSonic from "./Characters/Sonic"
import { SpriteType, MoveType, Direction } from "./Character"

const sonicDiv : HTMLDivElement = document.querySelector("#sonic")
let sonic = createSonic()


let keyBeingPressed : string = "";
window.addEventListener("keydown", function(event: KeyboardEvent) {
    if (event.key == "ArrowRight" && keyBeingPressed != event.key) {
        keyBeingPressed = event.key;
        sonic.move(
            MoveType.Walk,
            Direction.Right
        )
    }

    if (event.key == "ArrowLeft" && keyBeingPressed != event.key) {
        keyBeingPressed = event.key;
        sonic.move(
            MoveType.Walk,
            Direction.Left
        )
    }
});

window.addEventListener("keyup", function() {
    if (keyBeingPressed) {
        keyBeingPressed = "";
        sonic.move()
    }
});

function reqAnimFrame() {

    sonic.updateMovement()

    sonicDiv.style.left = `${sonic.getPosition()[0]}px`
    sonicDiv.style.top = `${sonic.getPosition()[1]}px`

    let classes = "";

    switch (sonic.getSpriteType()) {
        case SpriteType.Walking:
            classes = "isWalking"
            break
        case SpriteType.Running:
            classes = "isRunning"
            break
        case SpriteType.Breaking:
            classes = "isBreaking"
            break
        default:
            classes = ""
    }

    if (sonic.getDirection() == Direction.Left) {
        classes += " isLeft"
    }

    sonicDiv.className = classes

    window.requestAnimationFrame(reqAnimFrame)
    return 1
}
window.requestAnimationFrame(reqAnimFrame)

let zoom : number = 1
document.querySelector("#zoomButtonPlus").addEventListener("click", function() : void {
    zoom *= 1.5
    updateZoom()
})
document.querySelector("#zoomButtonMinus").addEventListener("click", function() : void {
    zoom /= 1.5
    updateZoom()
})


window.addEventListener("keypress", function(event: KeyboardEvent) {
    if (event.key == "+") {
        zoom *= 1.5
        updateZoom()
    } else if (event.key == "-") {
        zoom /= 1.5
        updateZoom()
    }
})

function updateZoom() : void {
    const screen : HTMLDivElement = document.querySelector("#screen")
    screen.style.transform = `scale(${zoom}, ${zoom})`
    screen.style.width = `calc(${(100 / zoom)}% - ${24 / zoom}px)`
}