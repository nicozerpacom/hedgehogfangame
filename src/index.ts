import createSonic from "./Characters/Sonic"
import { SpriteType, MoveType, Direction } from "./Character"

const sonicDiv : HTMLDivElement = document.querySelector("#sonic")
const sonicHitbox : HTMLDivElement = sonicDiv.querySelector(".hitbox")
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

let lelele : any
function reqAnimFrame() {

    sonic.updateMovement()

    sonicDiv.style.left = `${sonic.getPosition().x}px`
    sonicDiv.style.top = `${sonic.getPosition().y}px`

    const sprite = sonic.getSprite()
    sonicDiv.style.backgroundImage = `url("/sprites/${sprite.fileName}.webp")`

    const spriteTypeChanged = sonicDiv.dataset.spriteType != String(sprite.type)
    sonicDiv.dataset.spriteType = String(sprite.type)

    
    let frameIndex = 0
    if (sprite.frames.length > 1) {
        
        if (!spriteTypeChanged) {
            frameIndex = parseInt(sonicDiv.dataset.frameIndex || "0")

            if (sonic.getShouldChangeSprite()) {
                frameIndex++
                if (frameIndex >= sprite.frames.length) {
                    frameIndex = 0
                }
                sonicDiv.dataset.frameIndex = String(frameIndex)
            }
        }
    }
    
    if (spriteTypeChanged) {
        sonicDiv.dataset.frameIndex = "0"
    }
    

    const currentFrame = sprite.frames[frameIndex]

    sonicDiv.style.width = `${currentFrame.width}px`
    sonicDiv.style.height = `${currentFrame.height}px`
    sonicDiv.style.transform = `translate(-${currentFrame.width / 2}px, -${currentFrame.height / 2}px)`
    sonicDiv.style.backgroundPosition = `-${currentFrame.imageOffset.x}px -${currentFrame.imageOffset.y}px`

    
    sonicHitbox.style.left = "50%"
    sonicHitbox.style.top = "50%"
    sonicHitbox.style.transform = `translate(${currentFrame.hitbox[0].x}px, ${currentFrame.hitbox[0].y}px)`
    sonicHitbox.style.width = `${Math.abs(currentFrame.hitbox[0].x) + Math.abs(currentFrame.hitbox[1].x)}px`
    sonicHitbox.style.height = `${Math.abs(currentFrame.hitbox[0].y) + Math.abs(currentFrame.hitbox[1].y)}px`
    
    if (sonic.getDirection() == Direction.Left) {
        sonicDiv.style.transform += ` rotateY(180deg)`
    }

    
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
    const screen : HTMLElement = document.body; //("#screen")
    screen.style.transform = `scale(${zoom}, ${zoom})`
    screen.style.width = `calc(${(100 / zoom)}% - ${24 / zoom}px)`
}