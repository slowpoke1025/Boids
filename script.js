

const MAX_PREDATOR_SPEED = 3
const ACC_RATE = 0.5
const config = {
    alignment: 1,
    cohesion: 0.1,
    separation: 1,
    distance: 60,
    bird_width: 30,
    predator: false,
    predator_width: 40,
    predator_height: 80,
    predator_vision: 100,
    vision: 80,
    vision_show: false,
    sep_vision_show: false,
    bird_num: 100,
    predator_num: 1,
    predator_eat: false,
    escape: 0.1,
    boundary: 30,
    "max-speed": 3
}
const canvas = document.getElementById("canvas")
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d")
const Birds = [];
const Predators = []
const birdImg = new Image()
birdImg.src = "./swallow.png";

const predatorImg = new Image()
predatorImg.src = "./eagle.webp";


const bombImg = new Image()
bombImg.src = "./explosion.png";

const modal = document.getElementById("modal")
const ctrlBtn = document.getElementById("control")
const cancelBtn = document.getElementById("cancel")
const controlContainer = modal.querySelector(".container")


const showPredator = document.getElementById("predator")
const predatorEat = document.getElementById("eating")
const showVision = document.getElementById("show-vision")
const showSepVision = document.getElementById("show-sep-vision")

showSepVision.addEventListener("change", e => {
    config.sep_vision_show = showSepVision.checked
})
showVision.addEventListener("change", e => {
    config.vision_show = showVision.checked
})
predatorEat.addEventListener("change", e => {
    config.predator_eat = predatorEat.checked
})

showPredator.addEventListener("change", e => {
    config.predator = showPredator.checked
})
function createControl(name, option) {
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

class Control {

    constructor(name, option) {
        const { range, number } = createControl(name, option)
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
const a = new Control("alignment", { value: config.alignment, min: 0, max: 1, step: 0.1 })
const c = new Control("cohesion", { value: config.cohesion, min: 0, max: 1, step: 0.1 })
const s = new Control("separation", { value: config.separation, min: 0, max: 5, step: 0.1 })
new Control("escape", { value: config.escape, min: 0, max: 1, step: 0.1 })
const v = new Control("vision", { value: config.vision, min: 0, max: 200, step: 10 })
new Control("distance", { value: config.distance, min: 0, max: 200, step: 10 })
new Control("max-speed", { value: config["max-speed"], min: 0, max: 5, step: 0.5 })


if (("ontouchstart" in document.documentElement)) {
    config.bird_num = 50;
    config.bird_width = 15;
    config.predator_width = 30
    config.predator_height = 60


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
    Birds.push(new Bird(e.pageX - config.bird_width / 2, e.pageY - config.bird_width / 2))
})

class Bird {
    constructor(x, y, flag) {
        this.x = x ?? random(canvas.width - config.bird_width);
        this.y = y ?? random(canvas.height - config.bird_width);
        this.vx = random(1, -1) * config["max-speed"];
        this.vy = random(1, -1) * config["max-speed"];
        this.f = { x: 0, y: 0 }
        this.img = birdImg
        // this.sprite = 0;
        // this.width = 834
        // this.maxSprite = 4
        // this.maxSpeed = 80
        // this.speed = true;
        this.flag = flag
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + config.bird_width / 2, this.y + config.bird_width / 2)
        ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 4 * 3)
        // ctx.fillRect(-config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)
        // ctx.drawImage(this.img, this.sprite * this.width, 0, this.width, this.width, -config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)

        ctx.drawImage(birdImg, -config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)

        ctx.restore()


        if (this.flag) {
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


        // if (this.speed) {
        //     this.sprite = (this.sprite + 1) % this.maxSprite
        //     this.speed = false
        //     setTimeout(() => {
        //         this.speed = true
        //     }, this.maxSpeed)

        // }
    }
    update() {

        this.vx += this.f.x * ACC_RATE;
        this.vy += this.f.y * ACC_RATE;
        // this.vx = this.vx > 0 ? Math.min(this.vx, config["max-speed"]) : Math.max(this.vx, -config["max-speed"])
        // this.vy = this.vy > 0 ? Math.min(this.vy, config["max-speed"]) : Math.max(this.vy, -config["max-speed"])

        // if (this.x > canvas.width)
        //     this.x -= canvas.width
        // else if (this.x < 0)
        //     this.x += canvas.width

        // if (this.y > canvas.height)
        //     this.y -= canvas.height
        // else if (this.y < 0)
        //     this.y += canvas.height


        this.detectBoundary()
        this.limitSpeed()


        this.x += this.vx
        this.y += this.vy
    }

    detectBoundary() {

        if (this.x > (canvas.width - config.boundary)) { this.vx -= config.boundary / (canvas.width - this.x) / (canvas.width - this.x) }
        else if (this.x < config.boundary) { this.vx += config.boundary / this.x / this.x }

        if (this.y > (canvas.height - config.boundary)) { this.vy -= config.boundary / (canvas.height - this.y) / (canvas.height - this.y) }
        else if (this.y < config.boundary) { this.vy += config.boundary / this.y / this.y }
    }
    getVector(other) {
        const vector = { x: other.x - this.x, y: other.y - this.y }
        // if (vector.x > canvas.width / 2)
        //     vector.x -= canvas.width
        // else if (vector.x < -canvas.width / 2)
        //     vector.x += canvas.width

        // if (vector.y > canvas.height / 2)
        //     vector.y -= canvas.height
        // else if (vector.y < -canvas.height / 2)
        //     vector.y += canvas.height

        vector.length = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
        return vector
    }
    limitSpeed() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (speed > config["max-speed"]) {
            this.vx = this.vx / speed * config["max-speed"]
            this.vy = this.vy / speed * config["max-speed"]
        }
    }
    generateForce() {
        this.f.x = 0
        this.f.y = 0
        const alignment = { x: 0, y: 0 }
        const cohesion = { x: 0, y: 0 }
        const separation = { x: 0, y: 0 }
        const escape = { x: 0, y: 0 }
        let total = 0;
        let pTotal = 0
        for (const bird of Birds) {

            if (bird === this) continue
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
        if (config.predator) {
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


        this.f.x += alignment.x / total * config.alignment + cohesion.x / total * config.cohesion + separation.x * config.separation
        this.f.y += alignment.y / total * config.alignment + cohesion.y / total * config.cohesion + separation.y * config.separation
        if (pTotal === 0) return
        this.f.x += escape.x / pTotal * config.escape
        this.f.y += escape.y / pTotal * config.escape
    }
}

const Bombs = []
class Bomb {
    constructor(x, y) {
        this.flag = true
        this.x = x
        this.y = y
        setTimeout(() => {
            const i = Bombs.findIndex(b => b === this)
            Bombs.splice(i, 1);
        }, 300)
    }
    draw() {
        ctx.drawImage(bombImg, this.x, this.y, config.bird_width, config.bird_width)
    }

}
class Predator {
    constructor() {
        this.x = random(0, canvas.width - config.predator_width);
        this.y = random(0, canvas.height - config.predator_height);
        this.vx = random(1, -1) * config["max-speed"];
        this.vy = random(1, -1) * config["max-speed"];
        this.f = { x: 0, y: 0 }
    }
    draw() {
        ctx.save();
        // ctx.fillStyle = "red"
        ctx.translate(this.x + config.predator_width / 2, this.y + config.predator_height / 2)
        ctx.rotate(Math.atan2(this.vy, this.vx))
        // ctx.fillRect(-config.predator_width / 2, -config.predator_width / 2, config.predator_width, config.predator_width)
        // ctx.drawImage(birdImg, this.sprite * this.width, 0, this.width, this.width, -config.bird_width / 2, -config.bird_width / 2, config.bird_width, config.bird_width)
        ctx.drawImage(predatorImg, -config.predator_width / 2, -config.predator_height / 2, config.predator_width, config.predator_height)
        ctx.restore()

    }
    update() {

        this.vx += this.f.x * ACC_RATE;
        this.vy += this.f.y * ACC_RATE;

        this.detectBoundary()
        this.limitSpeed()

        this.x += this.vx
        this.y += this.vy
        if (config.predator_eat) {
            for (const bird of Birds) {
                if (!bird.flag && collision(bird, this)) {
                    Bombs.push(new Bomb(bird.x, bird.y))
                    const i = Birds.findIndex(b => b === bird)
                    Birds.splice(i, 1);
                }
            }
        }

    }
    generateForce() {
        this.f.x = 0
        this.f.y = 0

        const cohesion = { x: 0, y: 0 }
        const alignment = { x: 0, y: 0 }
        const separation = { x: 0, y: 0 }


        let total = 0
        let pTotal = 0

        for (let b of Birds) {
            const vector = this.getVector(b)

            if (vector.length < config.predator_vision) {
                ++total
                cohesion.x += vector.x
                cohesion.y += vector.y
                alignment.x += b.vx
                alignment.y += b.vy
            }

        }
        for (let p of Predators) {
            if (p === this)
                continue
            const vector = this.getVector(p)

            if (vector.length < config.predator_vision) {
                pTotal++
                separation.x += -vector.x / vector.length / vector.length * config.predator_vision;
                separation.y += -vector.y / vector.length / vector.length * config.predator_vision;
            }
        }

        if (total !== 0) {
            this.f.x += cohesion.x / total * 0.1
            this.f.y += cohesion.y / total * 0.1
        }
        if (pTotal !== 0) {
            this.f.x += separation.x
            this.f.y += separation.y
        }

    }

    getVector(other) {
        const vector = { x: other.x - this.x, y: other.y - this.y }
        vector.length = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
        return vector
    }
    limitSpeed() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (speed > MAX_PREDATOR_SPEED) {
            this.vx = this.vx / speed * MAX_PREDATOR_SPEED
            this.vy = this.vy / speed * MAX_PREDATOR_SPEED
        }
    }
    detectBoundary() {

        if (this.x > (canvas.width - config.boundary)) { this.vx -= config.boundary / (canvas.width - this.x) / (canvas.width - this.x) }
        else if (this.x < config.boundary) { this.vx += config.boundary / this.x / this.x }

        if (this.y > (canvas.height - config.boundary)) { this.vy -= config.boundary / (canvas.height - this.y) / (canvas.height - this.y) }
        else if (this.y < config.boundary) { this.vy += config.boundary / this.y / this.y }
    }
}




for (let index = 0; index < config.bird_num; index++) {
    Birds.push(new Bird(null, null))
}
Birds.push(new Bird(null, null, true))


for (let index = 0; index < config.predator_num; index++) {
    Predators.push(new Predator())
}
animate()


function animate() {


    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const bird of Birds) {
        bird.generateForce()
        bird.update()
        bird.draw()
    }
    if (config.predator) {
        for (const p of Predators) {
            p.generateForce()
            p.update()
            p.draw()

        }
    }
    for (const b of Bombs) {
        b.draw()
    }

    requestAnimationFrame(animate)

}


function randomInt(max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
function random(max, min = 0) {
    return Math.random() * (max - min) + min
}
function collision(bird, predator) {

    const flag = bird.x > predator.x + config.predator_width ||
        bird.x + config.bird_width < predator.x ||
        bird.y >= predator.y + config.predator_width ||
        bird.y + config.bird_width <= predator.y;
    return !flag;
}