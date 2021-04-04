import "./Styles/styles.scss"

import createSonic from "./Characters/Sonic"
import Point, { Rect } from "./Point"
import { MoveType, Direction } from "./Character"
import Platform from "./Platform"
import { AllHitboxes } from "./SolidObjects"
import * as _ from "lodash"


(async function() {
    const playSounds = true

    const allHitboxes : AllHitboxes = []

    const canvas = document.querySelector("#canvas") as HTMLCanvasElement


    const tileData : { default : string } = await import(`./Assets/Tiles/${"testPlatform"}.webp`)

    const floor = Platform.createFromLeftTop(
        new Point(-350, 120),
        new Point(1600, 200), 
        tileData.default,
        [
            new Point(0, 83),
            new Point(481, 83),
            new Point(481, 41),
            new Point(577, 41),
            new Point(698, 0),
            new Point(1085, 0),
            new Point(1200, 42),
            new Point(1600, 42),
            new Point(1600, 200),
            new Point(0, 200)
        ]
    )
    const sonic = createSonic(new Point(199, 155), allHitboxes, [floor])

    allHitboxes.push(sonic)

    let keysBeingPressed : string[] = [];
    window.addEventListener("keydown", function(event: KeyboardEvent) {
        const key = String(event.key).toUpperCase()

        if (key == "ARROWRIGHT" && !keysBeingPressed.includes(key)) {
            keysBeingPressed.push(key);
            event.preventDefault()
        }

        if (key == "ARROWLEFT" && !keysBeingPressed.includes(key)) {
            keysBeingPressed.push(key);
            event.preventDefault()
        }

        if (
            ["A", "S", "D"].includes(key)
            && keysBeingPressed.filter(key => ["A", "S", "D"].includes(key)).length == 0
        ) {
            keysBeingPressed.push(key)
            event.preventDefault()
        }
    });

    window.addEventListener("keyup", function(event : KeyboardEvent) {
        const key = String(event.key).toUpperCase()
        const keyIndex = keysBeingPressed.indexOf(key)

        if (keyIndex != -1) {
            keysBeingPressed.splice(keyIndex, 1)
        }
    });



    const sonicImgData = await import(`./Assets/sprites/${sonic.getSpriteImage()}.webp`)    
    const sonicImg = new Image()
    sonicImg.src = sonicImgData.default

    const canvasContext = canvas.getContext("2d")
    canvasContext.imageSmoothingEnabled = false


    async function reqAnimFrame() {
        canvasContext.fillStyle = 'hsl(0, 0%, 10%)'
        canvasContext.fillRect(0, 0, canvas.width, canvas.height)

        canvasContext.fillStyle = 'hsl(0, 0%, 15%)'

        _.range(0, canvas.width, 10).forEach(function(valueX) {
            _.range(valueX % 20, canvas.height, 20).forEach(function(valueY) {
                canvasContext.fillRect(valueX, valueY, 10, 10)
            })
        })


        canvasContext.fillStyle = "hsl(0, 0%, 90%)"
        canvasContext.beginPath()
        canvasContext.moveTo(
            floor.getPositionleftTop().x + floor.points[0].x,
            floor.getPositionleftTop().y + floor.points[0].y
        )
        floor.points.slice(1).forEach(function(point) {
            canvasContext.lineTo(
                floor.getPositionleftTop().x + point.x,
                floor.getPositionleftTop().y + point.y
            )
        })
        canvasContext.fill()


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
            if (jumpAudio) {
                jumpAudio.play()
            }
            sonicMoved = true
        }
        
        if (!sonicMoved) {
            movements.push([MoveType.None, null])
        }

        sonic.move(movements)

        sonic.updateMovement()

        const sprite = sonic.getSprite()

        const currentFrame = sprite.frames[sonic.getSpriteFrameIndex()]
        const rect = currentFrame.frame.getRect(sonic.getPosition())
        
        // Sonic
        let positionX = rect.getLeft()
        if (sonic.getDirection() == Direction.Left) {
            canvasContext.save()
            canvasContext.translate(canvas.width, 0)
            canvasContext.scale(-1, 1)

            positionX = canvas.width - rect.getLeft() - currentFrame.frame.width
        }

        canvasContext.drawImage(
            sonicImg,
            currentFrame.frame.imageOffset.x,
            currentFrame.frame.imageOffset.y,
            currentFrame.frame.width,
            currentFrame.frame.height,
            positionX,
            rect.getTop(),
            currentFrame.frame.width,
            currentFrame.frame.height
        )
        canvasContext.restore()

        const sensors = sonic.getSpriteSensors()
        canvasContext.fillStyle = "#FFFF00"
        canvasContext.fillRect(sensors.leftTop.x - 1, sensors.leftTop.y - 1, 2, 2)
        canvasContext.fillRect(sensors.leftCenter.x - 1, sensors.leftCenter.y - 1, 2, 2)
        canvasContext.fillRect(sensors.leftBottom.x - 1, sensors.leftBottom.y - 1, 2, 2)
        canvasContext.fillRect(sensors.rightTop.x - 1, sensors.rightTop.y - 1, 2, 2)
        canvasContext.fillRect(sensors.rightCenter.x - 1, sensors.rightCenter.y - 1, 2, 2)
        canvasContext.fillRect(sensors.rightBottom.x - 1, sensors.rightBottom.y - 1, 2, 2)

        canvasContext.fillStyle = "#00FF00"
        canvasContext.fillRect(sonic.getPosition().x - 1, sonic.getPosition().y - 1, 2, 2)

        
        

        window.requestAnimationFrame(reqAnimFrame)
        return 1
    }
    window.requestAnimationFrame(reqAnimFrame)
    

    let jumpAudio = null
    if (playSounds) {
        const levelAudioContext = new AudioContext()

        import(`./Assets/sounds/${"angelisland1"}.ogg`)
            .then(asset => fetch(asset.default, { mode: "cors" }))
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

        import(`./Assets/sounds/${"jump"}.ogg`).then(function(asset) {
            jumpAudio = new Audio(asset.default)
            jumpAudio.volume = 0.35
        })
    }


    function updateZoom() {
        if (window.innerWidth >= window.innerHeight) {
            canvas.style.width = `${window.innerHeight * 16 / 9}px`
            canvas.style.height = `${window.innerHeight}px`
        } else {
            canvas.style.width = `${window.innerWidth}px`
            canvas.style.height = `${window.innerWidth * 9 / 16}px`
        }
    }
    updateZoom()

    window.addEventListener("resize", updateZoom)

})()