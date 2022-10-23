// const repulsion = { x: 0, y: 0 }
// let total = 0

// for (const predator of Predators) {
//     // 自己到掠食者的向量
//     const vector = this.getVector(bird)

//     //若位於視野範圍內
//     if (vector.length < config.vision) {
//         //向量加總
//         repulsion.x += predator.x - this.x
//         repulsion.y += predator.y - this.y
//         ++total
//     }
// }
// //取平均
// repulsion.x /= total
// repulsion.y /= total

const Birds = []




const separation = new Vector()

for (const bird of Birds) {
    const vector = this.getVector(bird)
    if (vector.length < this.vision) {
        separation +=
            (this.position - bird.position) / vector.length ** 2 * this.vision
    }
}
separation *= FACTOR.separation
