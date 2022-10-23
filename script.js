const ACC_RATE = 0.5
const config = {
    alignment: 1,
    cohesion: 0.1,
    separation: 1,
    repulsion: 0.1,

    "sep-vision": 80,
    vision: 80,
    bird_width: 30,
    bird_num: 100,
    boundary: 150,
    boundary_force: 1,
    "max-speed(b)": 3,
    "max-speed(p)": 3.5,
    predator: false,
    predator_num: 2,
    predator_width: 40,
    predator_vision: 80,
    vision_show: false,
    sep_vision_show: false,
}

const canvas = document.getElementById("canvas")
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d")
const Birds = [];
const Predators = []

const birdImg = new Image()
birdImg.src = "./swallow.png";

const demoImg = new Image()
demoImg.src = "./demo.png";

const predatorImg = new Image()
predatorImg.src = "./predator.png";


const bombImg = new Image()
bombImg.src = "./blood.png";

const modal = document.getElementById("modal")
const ctrlBtn = document.getElementById("control")
const cancelBtn = document.getElementById("cancel")
const controlContainer = modal.querySelector(".container")


const showPredator = document.getElementById("predator")
const showVision = document.getElementById("show-vision")
const showSepVision = document.getElementById("show-sep-vision")

showSepVision.addEventListener("change", e => {
    config.sep_vision_show = showSepVision.checked
})
showVision.addEventListener("change", e => {
    config.vision_show = showVision.checked
})


showPredator.addEventListener("change", e => {
    config.predator = showPredator.checked
})


class Control {
    static createControl(name, option) {
        const { min, max, step, value } = option
        const inputBox = document.createElement("div")
        const label = document.createElement("label")
        const range = document.createElement("input")
        const number = document.createElement("input")
        inputBox.className = "input-box"
        label.textContent = name
        range.type = "range"
        range.min = min
        range.max = max
        range.step = step
        range.value = value
        number.type = "text"
        number.value = value
        inputBox.append(label, range, number)
        controlContainer.append(inputBox)
        return { range, number }
    }
    constructor(name, option) {
        const { range, number } = Control.createControl(name, option)
        this.name = name
        this.range = range
        this.number = number
        this.updateNumber = this._updateNumber.bind(this)
        this.range.addEventListener("mousedown", e => {
            this.range.addEventListener("mousemove", this.updateNumber)
            this.range.addEventListener("touchmove", this.updateNumber)
        })

        this.range.addEventListener("mouseup", e => {
            this.range.removeEventListener("mousemove", this.updateNumber)
            this.range.removeEventListener("touchmove", this.updateNumber)
        })

        this.range.addEventListener("change", e => {
            config[this.name] = Number(this.range.value)
            this.number.value = this.range.value
        })
    }
    _updateNumber() {
        this.number.value = this.range.value
    }
}




if (canvas.width < 480 && ("ontouchstart" in document.documentElement)) {
    config.bird_num = 50;
    config.bird_width = 15;
    config.vision = 50
    config["sep-vision"] = 50
}
new Control("alignment", { value: config.alignment, min: 0, max: 1, step: 0.1 })
new Control("cohesion", { value: config.cohesion, min: 0, max: 1, step: 0.1 })
new Control("separation", { value: config.separation, min: 0, max: 5, step: 0.1 })
new Control("repulsion", { value: config.repulsion, min: 0, max: 1, step: 0.05 })
new Control("vision", { value: config.vision, min: 0, max: 500, step: 10 })
new Control("sep-vision", { value: config["sep-vision"], min: 0, max: 500, step: 10 })
new Control("boundary", { value: config.boundary, min: 0, max: 500, step: 10 })


new Control("max-speed(b)", { value: config["max-speed(b)"], min: 0, max: 10, step: 0.5 })
new Control("max-speed(p)", { value: config["max-speed(p)"], min: 0, max: 5, step: 0.5 })

window.addEventListener("resize", e => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})

ctrlBtn.addEventListener("click", e => {
    modal.showModal()
    e.stopPropagation()
})

let start = false
cancelBtn.addEventListener("click", e => {
    modal.close()
    e.stopPropagation()
    if (!start) {
        animate()
        start = true
    }
})


document.addEventListener("click", e => {
    Birds.push(new Bird(birdImg, e.pageX - config.bird_width / 2, e.pageY - config.bird_width / 2))
})

class Bird {
    constructor(img, x, y) {
        this.x = x ?? random(canvas.width - config.bird_width);
        this.y = y ?? random(canvas.height - config.bird_width);
        this.vx = random(1, -1) * config["max-speed(b)"];
        this.vy = random(1, -1) * config["max-speed(b)"];
        this.f = { x: 0, y: 0 }
        this.img = img
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + config.bird_width / 2, this.y + config.bird_width / 2)
        ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 4 * 3)
        // ctx.fillRect(-config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)
        // ctx.drawImage(this.img, this.sprite * this.width, 0, this.width, this.width, -config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)

        ctx.drawImage(this.img, -config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)

        ctx.restore()
    }
    update() {
        this.vx += this.f.x * ACC_RATE;
        this.vy += this.f.y * ACC_RATE;
        this.detectBoundary()
        this.limitSpeed()
        this.x += this.vx
        this.y += this.vy
    }

    detectBoundary() {
        if (this.x + this.vx > (canvas.width - config.bird_width - config.boundary)) { this.vx -= config.boundary / (canvas.width - config.bird_width - this.x) ** 2 }
        else if (this.x + this.vx < config.boundary) { this.vx += config.boundary / this.x / this.x }

        if (this.y + this.vy > (canvas.height - config.bird_width - config.boundary)) { this.vy -= config.boundary / (canvas.height - config.bird_width - this.y) ** 2 }
        else if (this.y + this.vy < config.boundary) { this.vy += config.boundary / this.y / this.y }

        // if (this.x + this.vx > (canvas.width - config.bird_width / 2 - config.boundary))
        //     this.vx -= config.boundary_force
        // else if (this.x + this.vx < config.boundary)
        //     this.vx += config.boundary_force

        // if (this.y + this.vy > (canvas.height - config.bird_width / 2 - config.boundary))
        //     this.vy -= config.boundary_force
        // else if (this.y + this.vy < config.boundary)
        //     this.vy += config.boundary_force

    }

    getVector(other) {
        const vector = { x: other.x - this.x, y: other.y - this.y }
        vector.length = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
        return vector
    }

    limitSpeed() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (speed > config["max-speed(b)"]) {
            this.vx = this.vx / speed * config["max-speed(b)"]
            this.vy = this.vy / speed * config["max-speed(b)"]
        }
    }

    generateForce() {
        this.f.x = 0
        this.f.y = 0
        const alignment = { x: 0, y: 0 }
        const cohesion = { x: 0, y: 0 }
        const separation = { x: 0, y: 0 }
        const repulsion = { x: 0, y: 0 }
        let total = 0
        let pTotal = 0

        for (const bird of Birds) {

            if (bird === this || !config.predator && bird.predator) continue
            const vector = this.getVector(bird)
            if (Math.atan2(vector.y, vector.x) > Math.PI) continue
            if (vector.length < config.vision) {
                ++total
                if (!this.predator) {
                    alignment.x += bird.vx
                    alignment.y += bird.vy
                }
                cohesion.x += vector.x
                cohesion.y += vector.y
            }

            if (vector.length < config["sep-vision"]) {
                separation.x += -vector.x / vector.length ** 2 * config["sep-vision"];
                separation.y += -vector.y / vector.length ** 2 * config["sep-vision"];
            }
        }

        if (config.predator && !this.demo) {
            for (const p of Predators) {
                const vector = this.getVector(p)
                if (vector.length < config.vision) {
                    ++pTotal
                    repulsion.x += -vector.x
                    repulsion.y += -vector.y
                }
            }
        }

        if (total > 0) {
            this.f.x =
                alignment.x / total * config.alignment
                + cohesion.x / total * config.cohesion
                + separation.x * config.separation

            this.f.y =
                alignment.y / total * config.alignment
                + cohesion.y / total * config.cohesion
                + separation.y * config.separation
        }



        if (pTotal > 0) {
            this.f.x += repulsion.x / pTotal * config.repulsion
            this.f.y += repulsion.y / pTotal * config.repulsion
        }


    }
}
class DemoBird extends Bird {
    constructor(img, x, y) {
        super(img, x, y)
        this.demo = true
    }

    draw() {
        super.draw()
        if (config.vision_show) {
            ctx.strokeStyle = "red"
            ctx.beginPath();
            ctx.arc(this.x + config.bird_width / 2, this.y + config.bird_width / 2, config.vision, 0, 2 * Math.PI);
            ctx.stroke();
        }
        if (config.sep_vision_show) {
            ctx.strokeStyle = "blue"
            ctx.beginPath();
            ctx.arc(this.x + config.bird_width / 2, this.y + config.bird_width / 2, config["sep-vision"], 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
}

const Bombs = []
class Bomb {
    constructor(x, y) {
        this.flag = true
        this.x = x
        this.y = y
        this.width = 512
        this.sprite = 0
        this.maxSprite = 6
    }
    draw() {
        ctx.drawImage(bombImg, this.sprite * this.width, 0, this.width, this.width, this.x, this.y, config.bird_width * 1.1, config.bird_width * 1.1)
    }
    update() {
        if (this.flag) {
            ++this.sprite
            this.flag = false
            if (this.sprite === this.maxSprite) {
                const i = Bombs.findIndex(b => b === this)
                Bombs.splice(i, 1);
                return
            }
            setTimeout(() => {
                this.flag = true
            }, 80)
        }
    }

}

class Predator extends Bird {
    constructor(img, x, y) {
        super(img, x, y)
        this.predator = true
        this.grow = 1;
    }
    limitSpeed() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (speed > config["max-speed(p)"]) {
            this.vx = this.vx / speed * config["max-speed(p)"]
            this.vy = this.vy / speed * config["max-speed(p)"]
        }
    }
    update() {
        super.update()
        if (true) {
            for (const bird of Birds) {
                if (!bird.demo && !bird.predator && collision(bird, this)) {
                    Bombs.push(new Bomb(bird.x, bird.y))
                    const i = Birds.findIndex(b => b === bird)
                    Birds.splice(i, 1);
                    this.grow *= 1.01
                }
            }
        }
    }
    generateForce() {
        this.f.x = 0
        this.f.y = 0

        const cohesion = { x: 0, y: 0 }


        let total = 0


        for (const bird of Birds) {
            if (bird.demo) continue
            const vector = this.getVector(bird)
            if (vector.length < config.vision) {
                ++total
                cohesion.x += vector.x
                cohesion.y += vector.y
            }
        }


        if (total > 0) {
            this.f.x = cohesion.x / total * config.cohesion
            this.f.y = cohesion.y / total * config.cohesion
        }


    }
    // detectBoundary() {
    //     if (this.x + this.vx > (canvas.width - config.bird_width - config.boundary)) { this.vx -= config.boundary / (canvas.width - config.bird_width - this.x) / (canvas.width - config.bird_width - this.x) }
    //     else if (this.x + this.vx < config.boundary) { this.vx += config.boundary / this.x / this.x }

    //     if (this.y + this.vy > (canvas.height - config.bird_width - config.boundary)) { this.vy -= config.boundary / (canvas.height - config.bird_width - this.y) / (canvas.height - config.bird_width - this.y) }
    //     else if (this.y + this.vy < config.boundary) { this.vy += config.boundary / this.y / this.y }

    // }
    draw() {
        ctx.save();
        ctx.translate(this.x + config.bird_width / 2, this.y + config.bird_width / 2)
        ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 4 * 3)
        // ctx.fillRect(-config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)
        // ctx.drawImage(this.img, this.sprite * this.width, 0, this.width, this.width, -config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)

        ctx.drawImage(this.img, -config.bird_width / 2, -config.bird_width / 2, config.bird_width * this.grow, config.bird_width * this.grow)

        ctx.restore()
    }
}

for (let index = 0; index < config.bird_num; index++) {
    Birds.push(new Bird(birdImg))
}
Birds.push(new DemoBird(demoImg))


for (let index = 0; index < config.predator_num; index++) {
    const p = new Predator(predatorImg)
    Predators.push(p)
    // Birds.push(p)
}

modal.showModal()



function animate() {

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // ctx.fillStyle = "skyblue"
    // ctx.fillRect(0, 0, canvas.width, config.boundary)
    // ctx.fillRect(0, canvas.height, canvas.width, -config.boundary)
    // ctx.fillRect(0, 0, config.boundary, canvas.height)
    // ctx.fillRect(canvas.width, 0, -config.boundary, canvas.height)
    for (const bird of Birds) {
        bird.generateForce()
        bird.update()
        bird.draw()
    }
    if (config.predator) {
        for (const predator of Predators) {
            predator.generateForce()
            predator.update()
            predator.draw()
        }
    }
    for (const b of Bombs) {
        b.draw()
        b.update()
    }

    requestAnimationFrame(animate)

}



function random(max, min = 0) {
    return Math.random() * (max - min) + min
}

function collision(bird, predator) {
    const flag = bird.x > predator.x + config.bird_width * predator.grow ||
        bird.x + config.bird_width < predator.x ||
        bird.y >= predator.y + config.bird_width * predator.grow ||
        bird.y + config.bird_width <= predator.y;
    return !flag;
}