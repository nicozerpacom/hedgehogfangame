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

    getPosYFromX(posX : number) : number[] {
        const points = this.getPositionedPoints()

        let output = points.filter(point => point.x == posX).map(point => point.y)

        if (output.length == 0) {

            output = points.map(function(point : Point, index : number) {
                const nextPoint = points[(index + 1 < points.length) ? index + 1 : 0]
                return { point, nextPoint }
            })
            .filter(item => Math.min(item.point.x, item.nextPoint.x) < posX && Math.max(item.point.x, item.nextPoint.x) > posX)
            .map(function ({ point, nextPoint } : { point : Point, nextPoint : Point }) : number {
                
                if (point.y == nextPoint.y) {
                    return point.y
                } else {
                    const adjacent = Math.max(point.x, nextPoint.x) - Math.min(point.x, nextPoint.x)
                    const opposite = Math.max(point.y, nextPoint.y) - Math.min(point.y, nextPoint.y)
                    const angle = Math.atan(opposite / adjacent)

                    const newAdjacent = Math.max(posX, point.x) - Math.min(posX, point.x)

                    if (point.y < nextPoint.y) {
                        return point.y + newAdjacent * Math.tan(angle)
                    } else {
                        return point.y - newAdjacent * Math.tan(angle)
                    }
                }
            })
        }

        return output.sort((a, b) => a - b)
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