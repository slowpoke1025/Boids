const ACC_RATE = 0.5
const config = {
    alignment: 1,
    cohesion: 0.1,
    separation: 1,
    escape: 0.1,

    distance: 80,
    vision: 80,
    bird_width: 30,
    bird_num: 100,
    boundary: 80,
    boundary_force: 0.8,
    "max-speed(b)": 3,
    "max-speed(p)": 4,
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
bombImg.src = "./explosion.png";

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
        })

        this.range.addEventListener("mouseup", e => {
            this.range.removeEventListener("mousemove", this.updateNumber)
        })
        this.range.addEventListener("mouseup", e => {
            this.range.removeEventListener("mousemove", this.updateNumber)
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
new Control("alignment", { value: config.alignment, min: 0, max: 1, step: 0.1 })
new Control("cohesion", { value: config.cohesion, min: 0, max: 1, step: 0.1 })
new Control("separation", { value: config.separation, min: 0, max: 5, step: 0.1 })
new Control("escape", { value: config.escape, min: 0, max: 1, step: 0.05 })
new Control("vision", { value: config.vision, min: 0, max: 200, step: 10 })
new Control("distance", { value: config.distance, min: 0, max: 200, step: 10 })
new Control("max-speed(b)", { value: config["max-speed(b)"], min: 0, max: 5, step: 0.5 })
new Control("max-speed(p)", { value: config["max-speed(p)"], min: 0, max: 5, step: 0.5 })



if (("ontouchstart" in document.documentElement)) {
    config.bird_num = 50;
    config.bird_width = 15;
}

window.addEventListener("resize", e => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})

ctrlBtn.addEventListener("click", e => {
    modal.showModal()
    e.stopPropagation()
})

cancelBtn.addEventListener("click", e => {
    modal.close()
    e.stopPropagation()
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
        // if (this.x > (canvas.width - config.boundary)) { this.vx -= config.boundary / (canvas.width - this.x) / (canvas.width - this.x) }
        // else if (this.x < config.boundary) { this.vx += config.boundary / this.x / this.x }

        // if (this.y > (canvas.height - config.boundary)) { this.vy -= config.boundary / (canvas.height - this.y) / (canvas.height - this.y) }
        // else if (this.y < config.boundary) { this.vy += config.boundary / this.y / this.y }

        if (this.x > (canvas.width - config.bird_width / 2 - config.boundary))
            this.vx -= config.boundary_force
        else if (this.x < config.boundary)
            this.vx += config.boundary_force

        if (this.y > (canvas.height - config.bird_width / 2 - config.boundary))
            this.vy -= config.boundary_force
        else if (this.y < config.boundary)
            this.vy += config.boundary_force

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
        const escape = { x: 0, y: 0 }
        let total = 0
        let pTotal = 0

        for (const bird of Birds) {

            if (bird === this || !config.predator && bird.predator) continue
            const vector = this.getVector(bird)

            if (vector.length < config.vision) {
                ++total
                alignment.x += bird.vx
                alignment.y += bird.vy
                cohesion.x += vector.x
                cohesion.y += vector.y
            }

            if (vector.length < config.distance) {
                separation.x += -vector.x / vector.length / vector.length * config.distance;
                separation.y += -vector.y / vector.length / vector.length * config.distance;
            }
        }

        if (config.predator && !this.predator) {
            for (const p of Predators) {
                const vector = this.getVector(p)
                if (vector.length < config.vision) {
                    ++pTotal
                    escape.x += -vector.x
                    escape.y += -vector.y
                }
            }
        }

        if (total === 0) return

        this.f.x +=
            alignment.x / total * config.alignment
            + cohesion.x / total * config.cohesion
            + separation.x * config.separation

        this.f.y +=
            alignment.y / total * config.alignment
            + cohesion.y / total * config.cohesion
            + separation.y * config.separation

        if (pTotal === 0) return

        this.f.x += escape.x / pTotal * config.escape
        this.f.y += escape.y / pTotal * config.escape
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
            ctx.arc(this.x + config.bird_width / 2, this.y + config.bird_width / 2, config.distance, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
}

class Predator extends Bird {
    constructor(img, x, y) {
        super(img, x, y)
        this.predator = true
    }
    limitSpeed() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (speed > config["max-speed(p)"]) {
            this.vx = this.vx / speed * config["max-speed(p)"]
            this.vy = this.vy / speed * config["max-speed(p)"]
        }
    }

    detectBoundary() {
        if (this.x > (canvas.width - config.boundary)) { this.vx -= config.boundary / (canvas.width - this.x) / (canvas.width - this.x) }
        else if (this.x < config.boundary) { this.vx += config.boundary / this.x / this.x }

        if (this.y > (canvas.height - config.boundary)) { this.vy -= config.boundary / (canvas.height - this.y) / (canvas.height - this.y) }
        else if (this.y < config.boundary) { this.vy += config.boundary / this.y / this.y }

    }
    draw() {
        ctx.save();
        ctx.translate(this.x + config.bird_width / 2, this.y + config.bird_width / 2)
        ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 4 * 3)
        // ctx.fillRect(-config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)
        // ctx.drawImage(this.img, this.sprite * this.width, 0, this.width, this.width, -config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)

        ctx.drawImage(this.img, -config.bird_width / 2, -config.bird_width / 2, config.bird_width * 1.1, config.bird_width * 1.1)

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
    Birds.push(p)
}
animate()


function animate() {

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const bird of Birds) {
        if (!config.predator && bird.predator)
            continue
        bird.generateForce()
        bird.update()
        bird.draw()
    }

    requestAnimationFrame(animate)

}



function random(max, min = 0) {
    return Math.random() * (max - min) + min
}

// function collision(bird, predator) {
//     const flag = bird.x > predator.x + config.predator_width ||
//         bird.x + config.bird_width < predator.x ||
//         bird.y >= predator.y + config.predator_width ||
//         bird.y + config.bird_width <= predator.y;
//     return !flag;
// }