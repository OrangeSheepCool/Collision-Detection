var canvas = document.querySelector('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const c = canvas.getContext('2d')

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

const colorArray = [
    '#3F595A',
    '#C6DDC1',
    '#FECFB1',
    '#F69175',
    '#3F595A'
]

window.addEventListener('mousemove', event => {
    mouse.x = event.x
    mouse.y = event.y
})

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    init()
})

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)]
}

function getDistance(x1, y1, x2, y2) {
    let xDistance = x2 - x1
    let yDistance = y2 - y1
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
}

function rotate(velocity, angle) {
    return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    }
}

function resolveCollision(c1, c2) {
    const xVelocityDiff = c1.velocity.x - c2.velocity.x
    const yVelocityDiff = c1.velocity.y - c2.velocity.y
    const xDist = c2.x - c1.x
    const yDist = c2.y - c1.y
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        const angle = -Math.atan2(c2.y - c1.y, c2.x - c1.x)
        const m1 = c1.mass
        const m2 = c2.mass
        const u1 = rotate(c1.velocity, angle)
        const u2 = rotate(c2.velocity, angle)
        const v1 = {
            x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2),
            y: u1.y
        }
        const v2 = {
            x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2),
            y: u2.y
        }
        const vFinal1 = rotate(v1, -angle)
        const vFinal2 = rotate(v2, -angle)
        c1.velocity.x = vFinal1.x
        c1.velocity.y = vFinal1.y
        c2.velocity.x = vFinal2.x
        c2.velocity.y = vFinal2.y
    }
}

class Circle {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.velocity = {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
        }
        this.radius = radius
        this.color = color
        this.mass = 1
        this.opacity = 0
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.save()
        c.globalAlpha = this.opacity
        c.fillStyle = this.color
        c.fill()
        c.restore()
        c.strokeStyle = this.color
        c.stroke()
        c.closePath()
    }
    update(circles) {
        this.draw()
        for (let i = 0; i < circles.length; i++) {
            if (this === circles[i]) continue
            if (getDistance(this.x, this.y, circles[i].x, circles[i].y) - this.radius * 2 < 0) {
                resolveCollision(this, circles[i])
            }
        }
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            this.velocity.x = -this.velocity.x
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.velocity.y = -this.velocity.y
        }
        if (getDistance(mouse.x, mouse.y, this.x, this.y) < 100 && this.opacity < 1) {
            this.opacity += 1
        } else if (this.opacity > 0) {
            this.opacity -= 1
            this.opacity = Math.max(0, this.opacity)
        }
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

let circleArray

function init() {

    circleArray = []

    for (let i = 0; i < 200; i++) {
        const radius = 20
        let x = randomRange(radius, canvas.width - radius)
        let y = randomRange(radius, canvas.height - radius)
        const color = randomColor(colorArray)
        if (i !== 0) {
            for (let j = 0; j < circleArray.length; j++) {
                if (getDistance(x, y, circleArray[j].x, circleArray[j].y) - radius * 2 < 0) {
                    x = randomRange(radius, canvas.width - radius)
                    y = randomRange(radius, canvas.height - radius)
                    j = -1
                }
            }
        }
        circleArray.push(new Circle(x, y, radius, color))
    }
}

function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    circleArray.forEach(c => c.update(circleArray))
}

init()
animate()