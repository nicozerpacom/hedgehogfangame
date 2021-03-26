export default class Speed {
    #currentSpeed : number
    #previousSpeed : number

    constructor() {
        this.#currentSpeed = 0
        this.#previousSpeed = 0
    }

    set(newSpeed : number) : number {
        this.#previousSpeed = this.#currentSpeed
        this.#currentSpeed = newSpeed

        return newSpeed
    }
    get = () : number => this.#currentSpeed
    getAbsolute = () : number => Math.abs(this.#currentSpeed)

    getPrevious = () : number => this.#previousSpeed
    getPreviousAbsolute = () : number => Math.abs(this.#previousSpeed)
}