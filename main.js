const AnimationDirection = {
    NORMAL: "normal",
    REVERSE: "reverse",
    ALTERNATE_REVERSE: "alternate-reverse"
}

class AnimationDuration {
    constructor(formato) {
        this.formato = formato
        if (typeof formato === "string") {
            this.parseString()
        } else if (typeof formato === "object") {
            if (!("cantidad" in formato && "unidadMedida" in formato)) {
                throw new TypeError("Error")
            }
            this.cantidad = formato.cantidad
            this.unidadMedida = formato.unidadMedida
        }
    }

    parseString() {
        const array = this.formato.split(" ")
        const unidadMedida = array.pop()
        const duration = array.pop()
        if (unidadMedida === "s") {
            this.cantidad = duration * 1000
        } else if (unidadMedida === "ms") {
            this.cantidad = duration
        }
    }

    toMs() {
        return this.unidadMedida === "s" ? this.cantidad * 1000 : this.cantidad
    }
}

class Timeline {
    constructor({ duration, rate, iterationCount, direction }) {

        this.duration = duration
        this.rate = rate
        this.iterationCount = iterationCount
        this.direction = direction ?? AnimationDirection.NORMAL
        this.dx = direction === AnimationDirection.REVERSE ? -1 : 1
        this.x = 0
        this.timer = null
        this.callback = null
        this.total = 0
    }

    forceCall(callback) {
        callback(this)
        this.x = this.x + this.dx
        this.total++

        if (this.isAtEnd() && this.iterationCount !== Infinity) {
            clearInterval(this.timer)
        }
    }

    isStart() {
        return this.total === 0
    }

    setOrigen(x) {
        this.x = x
    }

    isAtEnd() {
        const ciclos = this.duration.toMs() / this.rate
        return this.total === this.iterationCount
            || this.total === ciclos
    }

    reverse() {
        this.dx = -1 * this.dx
    }

    reset() {
        this.total = 0
        if (this.dx > 0) {
            this.setOrigen(0)
        } else {
            const ciclos = this.duration.toMs() / this.rate
            this.setOrigen(this.iterationCount === Infinity ? ciclos - 1 : this.iterationCount - 1)
        }
    }

    getDuration() {
  
    }

    addClip(callback) {
        this.callback = callback
    }

    play() {
        this.reset()
        this.timer = setInterval(this.forceCall.bind(this), this.rate, this.callback)
    }

    synchronize() {
        clearInterval(this.timer)
        this.timer = setInterval(this.forceCall.bind(this), this.rate, this.callback)
    }

}





let anterior = null
const todos = document.querySelectorAll(".ball")

function update(anterior, actual) {
    if (anterior) {
        anterior.setAttribute("class", "ball")
    }
    actual.setAttribute("class", "ball ball__activo")
}

function draw(anim) {
    if (!anim.isStart() && anim.isAtEnd()) {
        anim.reverse()
        anim.reset()
    }
    const actual = todos[anim.x]
    update(anterior, actual)
    anterior = actual
}

const timeline = new Timeline({
    duration: new AnimationDuration("3 s"),
    rate: 1000,
    iterationCount: Infinity,
    direction: AnimationDirection.ALTERNATE_REVERSE
})

timeline.addClip(draw)
timeline.play()