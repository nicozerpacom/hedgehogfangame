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


    const tileData : { default : string } = await import(`./Assets/Tiles/testPlatform.webp`)

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

    const cameraCenter = new Point(canvas.width / 2, canvas.height / 2)
    const cameraOffset = new Point(0, 0)

    async function reqAnimFrame() {

        canvasContext.fillStyle = 'hsl(0, 0%, 10%)'
        canvasContext.fillRect(0, 0, canvas.width, canvas.height)

        canvasContext.fillStyle = 'hsl(0, 0%, 15%)'

        _.range(0, canvas.width, 10).forEach(function(valueX) {
            _.range(valueX % 20, canvas.height, 20).forEach(function(valueY) {
                canvasContext.fillRect(valueX, valueY, 10, 10)
            })
        })


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

        
        const positionWithoutOffset = new Point(
            sonic.getPosition().x - (cameraCenter.x - canvas.width / 2),
            sonic.getPosition().y - (cameraCenter.y - canvas.height / 2)
        )

        if (positionWithoutOffset.x >= 160) {
            cameraCenter.x += Math.min(16, positionWithoutOffset.x - 160)
        } else if (positionWithoutOffset.x <= 144) {
            cameraCenter.x -= Math.min(16, 144 - positionWithoutOffset.x)
        }

        if (positionWithoutOffset.y >= 128) {
            cameraCenter.y += Math.min(16, positionWithoutOffset.y - 128)
        } else if (positionWithoutOffset.y <= 64) {
            cameraCenter.y -= Math.min(16, 64 - positionWithoutOffset.y)
        }

        cameraOffset.x = cameraCenter.x - canvas.width / 2
        cameraOffset.y = cameraCenter.y - canvas.height / 2

        // Sonic
        let positionX = rect.getLeft()

        positionX -= cameraOffset.x

        if (sonic.getDirection() == Direction.Left) {
            canvasContext.save()
            canvasContext.translate(canvas.width, 0)
            canvasContext.scale(-1, 1)

            positionX = canvas.width - positionX - currentFrame.frame.width
        }

        canvasContext.drawImage(
            sonicImg,
            currentFrame.frame.imageOffset.x,
            currentFrame.frame.imageOffset.y,
            currentFrame.frame.width,
            currentFrame.frame.height,
            positionX,
            rect.getTop() - cameraOffset.y,
            currentFrame.frame.width,
            currentFrame.frame.height
        )
        canvasContext.restore()

        // Floor
        canvasContext.fillStyle = "hsl(0, 0%, 90%)"
        canvasContext.beginPath()
        canvasContext.moveTo(
            floor.getPositionleftTop().x - cameraOffset.x + floor.points[0].x,
            floor.getPositionleftTop().y - cameraOffset.y + floor.points[0].y
        )
        floor.points.slice(1).forEach(function(point) {
            canvasContext.lineTo(
                floor.getPositionleftTop().x - cameraOffset.x + point.x,
                floor.getPositionleftTop().y - cameraOffset.y + point.y
            )
        })
        canvasContext.fill()


        // Sensors
        const sensors = sonic.getSpriteSensors()
        canvasContext.fillStyle = "#FFFF00"
        canvasContext.fillRect(sensors.leftTop.x - cameraOffset.x, sensors.leftTop.y - cameraOffset.y, 1, 1)
        canvasContext.fillRect(sensors.leftCenter.x - cameraOffset.x, sensors.leftCenter.y - cameraOffset.y, 1, 1)
        canvasContext.fillRect(sensors.leftBottom.x - cameraOffset.x, sensors.leftBottom.y - cameraOffset.y, 1, 1)
        canvasContext.fillRect(sensors.rightTop.x - cameraOffset.x, sensors.rightTop.y - cameraOffset.y, 1, 1)
        canvasContext.fillRect(sensors.rightCenter.x - cameraOffset.x, sensors.rightCenter.y - cameraOffset.y, 1, 1)
        canvasContext.fillRect(sensors.rightBottom.x - cameraOffset.x, sensors.rightBottom.y - cameraOffset.y, 1, 1)

        canvasContext.fillStyle = "#00FF00"
        canvasContext.fillRect(sonic.getPosition().x - 1 - cameraOffset.x, sonic.getPosition().y - 1 - cameraOffset.y, 2, 2)
        

        window.requestAnimationFrame(reqAnimFrame)
        return 1
    }
    window.requestAnimationFrame(reqAnimFrame)
    

    let jumpAudio = null
    if (playSounds) {
        const levelAudioContext = new AudioContext()

        import(`./Assets/sounds/angelisland1.ogg`)
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

        import(`./Assets/sounds/jump.ogg`).then(function(asset) {
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