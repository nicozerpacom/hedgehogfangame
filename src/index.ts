import createSonic from "./Characters/Sonic"
import Point, { Rect } from "./Point"
import { MoveType, Direction } from "./Character"
import Platform from "./Platform"
import { AllHitboxes } from "./SolidObjects"


const allHitboxes : AllHitboxes = []

const sonicDiv : HTMLDivElement = document.querySelector("#sonic")
const sonicHitbox : HTMLDivElement = sonicDiv.querySelector(".hitbox")

const floorDiv : HTMLDivElement = document.querySelector("#floor")
const floorHitbox : HTMLDivElement = document.querySelector("#floorHitbox")


const floor = new Platform(
    new Point(800, 260),
    Rect.create(-800, -35, 800, 35),
    Rect.create(-800, -25, 800, 35)
)
const sonic = createSonic(new Point(30, 201), allHitboxes)

allHitboxes.push(sonic)
allHitboxes.push(floor)

let keysBeingPressed : string[] = [];
window.addEventListener("keydown", function(event: KeyboardEvent) {
    const key = String(event.key).toUpperCase()

    if (key == "ARROWRIGHT" && !keysBeingPressed.includes(key)) {
        keysBeingPressed.push(key);
    }

    if (key == "ARROWLEFT" && !keysBeingPressed.includes(key)) {
        keysBeingPressed.push(key);
    }

    if (
        ["A", "S", "D"].includes(key)
        && keysBeingPressed.filter(key => ["A", "S", "D"].includes(key)).length == 0
    ) {
        keysBeingPressed.push(key)
    }
});

window.addEventListener("keyup", function(event : KeyboardEvent) {
    const key = String(event.key).toUpperCase()
    const keyIndex = keysBeingPressed.indexOf(key)

    if (keyIndex != -1) {
        keysBeingPressed.splice(keyIndex, 1)
    }
});

function reqAnimFrame() {

    let sonicMoved = false

    const movements : Array<[MoveType, Direction]> = []
    if (keysBeingPressed.includes("ARROWLEFT")) {

        movements.push([MoveType.Walk, Direction.Left])
        sonicMoved = true
    } else if (keysBeingPressed.includes("ARROWRIGHT")) {
        movements.push([MoveType.Walk, Direction.Right])
        sonicMoved = true
    }
    
    if (keysBeingPressed.filter(key => ["A", "S", "D"].includes(key)).length > 0) {
        movements.push([MoveType.Jump, null])
        jumpAudio.play()
        sonicMoved = true
    }
    
    if (!sonicMoved) {
        movements.push([MoveType.None, null])
    }

    sonic.move(movements)

    sonic.updateMovement()

    const sprite = sonic.getSprite()
    sonicDiv.style.backgroundImage = `url("/sprites/${sprite.fileName}.webp")`

    const currentFrame = sprite.frames[sonic.getSpriteFrameIndex()]

    const rect = currentFrame.getRect(sonic.getPosition())

    sonicDiv.style.left = `${rect.leftTop.x}px`
    sonicDiv.style.top = `${rect.leftTop.y}px`

    sonicDiv.style.width = `${currentFrame.width}px`
    sonicDiv.style.height = `${currentFrame.height}px`
    sonicDiv.style.backgroundPosition = `-${currentFrame.imageOffset.x}px -${currentFrame.imageOffset.y}px`

    sonicHitbox.style.left = "50%"
    sonicHitbox.style.top = "50%"
    sonicHitbox.style.transform = `translate(${currentFrame.hitbox[0].x}px, ${currentFrame.hitbox[0].y}px)`
    sonicHitbox.style.width = `${Math.abs(currentFrame.hitbox[0].x) + Math.abs(currentFrame.hitbox[1].x)}px`
    sonicHitbox.style.height = `${Math.abs(currentFrame.hitbox[0].y) + Math.abs(currentFrame.hitbox[1].y)}px`
    
    if (sonic.getDirection() == Direction.Left) {
        sonicDiv.style.transform = "rotateY(180deg)"
    } else {
        sonicDiv.style.transform = ""
    }

    floorDiv.style.left = `${floor.getPositionleftTop().x}px`
    floorDiv.style.top = `${floor.getPositionleftTop().y}px`
    floorDiv.style.width = `${floor.rect.getWidth()}px`
    floorDiv.style.height = `${floor.rect.getHeight()}px`

    floorHitbox.style.left = `${floor.getHitbox().getLeft()}px`
    floorHitbox.style.top = `${floor.getHitbox().getTop()}px`
    floorHitbox.style.width = `${floor.getHitbox().getWidth()}px`
    floorHitbox.style.height = `${floor.getHitbox().getHeight()}px`

    // console.log(sonic.findCollisions())
    
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
    switch (String(event.key).toUpperCase()) {
        case "+":
            zoom *= 1.5
            updateZoom()
            break
        case "-":
            zoom /= 1.5
            updateZoom()
            break
    }
    
})

function updateZoom() : void {
    const screen : HTMLElement = document.body;
    screen.style.transform = `scale(${zoom}, ${zoom})`
    screen.style.width = `calc(${(100 / zoom)}% - ${24 / zoom}px)`
}

const levelAudioContext = new AudioContext()

fetch("/sounds/angelisland1.ogg", { mode: "cors" })
    .then((response : Response) : Promise<ArrayBuffer> => response.arrayBuffer())
    .then((buffer : ArrayBuffer) : Promise<AudioBuffer> => levelAudioContext.decodeAudioData(buffer, initPlayLoop))


let srcNode : AudioBufferSourceNode
let audioData : AudioBuffer
function initPlayLoop(buffer : AudioBuffer) : void {
    if (!audioData) {
        audioData = buffer
    }
    srcNode = levelAudioContext.createBufferSource()
    srcNode.buffer = buffer
    srcNode.connect(levelAudioContext.destination)
    srcNode.loop = true
    
    playLoop()
}
  
function playLoop() {
    if (levelAudioContext.state == "running") {
        srcNode.start()
    } else {
        setTimeout(function() {
            levelAudioContext.resume()
            playLoop()
        }, 500)
    }
}

const jumpAudio = new Audio("/sounds/jump.ogg")
jumpAudio.volume = 0.35
