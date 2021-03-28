export default class Point {
    constructor(
        public x : number,
        public y : number
    ) {
    }

    set(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export class Rect {
    constructor(
        public readonly leftTop: Point,
        public readonly rightTop: Point,
        public readonly leftBottom: Point,
        public readonly rightBottom: Point
    ) {}

    static create(left : number, top : number, right : number, bottom : number) : Rect {
        return new Rect(
            new Point(left, top),
            new Point(right, top),
            new Point(left, bottom),
            new Point(right, bottom)
        )
    }

    getLeft = () : number => this.leftTop.x
    getTop = () : number => this.leftTop.y
    getRight = () : number => this.rightTop.x
    getBottom = () : number => this.leftBottom.y

    getWidth = () : number =>
        Math.max(
            this.leftTop.x,
            this.rightTop.x,
            this.leftBottom.x,
            this.rightBottom.x
        ) - Math.min(
            this.leftTop.x,
            this.rightTop.x,
            this.leftBottom.x,
            this.rightBottom.x
        )

    getHeight = () : number =>
        Math.max(
            this.leftTop.y,
            this.rightTop.y,
            this.leftBottom.y,
            this.rightBottom.y
        ) - Math.min(
            this.leftTop.y,
            this.rightTop.y,
            this.leftBottom.y,
            this.rightBottom.y
        )
}