import Point, { Rect } from "./Point";
import { HasHitbox } from "./SolidObjects"

export default class Platform {

    
    constructor(
        public readonly center : Point,
        public readonly dimensions : Point,
        public readonly tileUrl : string,
        public readonly points : Point[]
    ) {}

    static createFromLeftTop(leftTop : Point, dimensions : Point, tileUrl : string, points : Point[]) {
        return new Platform(
            new Point(leftTop.x + dimensions.x / 2, leftTop.y + dimensions.y / 2),
            dimensions,
            tileUrl,
            points
        )
    }


    protected getPosFromOther(pos : number, coordType : "x" | "y") : number[] {
        const points = this.getPositionedPoints()

        const otherCoordType = coordType == "x" ? "y" : "x"

        let output = points.filter(point => point[coordType] == pos).map(point => point[otherCoordType])

        if (output.length == 0) {

            output = points.map(function(point : Point, index : number) {
                const nextPoint = points[(index + 1 < points.length) ? index + 1 : 0]
                return { point, nextPoint }
            })
            .filter(item => Math.min(item.point[coordType], item.nextPoint[coordType]) < pos && Math.max(item.point[coordType], item.nextPoint[coordType]) > pos)
            .map(function ({ point, nextPoint } : { point : Point, nextPoint : Point }) : number {
                
                if (point.y == nextPoint[otherCoordType]) {
                    return point[otherCoordType]
                } else {
                    const adjacent = Math.max(point[coordType], nextPoint[coordType]) - Math.min(point[coordType], nextPoint[coordType])
                    const opposite = Math.max(point[otherCoordType], nextPoint[otherCoordType]) - Math.min(point[otherCoordType], nextPoint[otherCoordType])
                    const angle = Math.atan(opposite / adjacent)

                    const newAdjacent = Math.max(pos, point[coordType]) - Math.min(pos, point[coordType])

                    if (point[otherCoordType] < nextPoint[otherCoordType]) {
                        return point[otherCoordType] + newAdjacent * Math.tan(angle)
                    } else {
                        return point[otherCoordType] - newAdjacent * Math.tan(angle)
                    }
                }
            })
        }

        return output.sort((a, b) => a - b)
    }

    getPosYFromX(posX : number) : number[] {
        return this.getPosFromOther(posX, "x")
    }
    getPosXFromY(posY : number) : number[] {
        return this.getPosFromOther(posY, "y")
    }

    getPositionedPoints = () : Point[] => this.points.map(
        (point : Point) => new Point(
            this.getPositionleftTop().x + point.x,
            this.getPositionleftTop().y + point.y
        )
    )

    getPositionleftTop = () : Point => new Point(
        this.center.x - this.dimensions.x / 2,
        this.center.y - this.dimensions.y / 2
    )
}