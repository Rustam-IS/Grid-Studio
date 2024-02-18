function size (factor) {
    const size = Math.min(
        window.innerHeight,
        window.innerWidth
    )
    return size * factor / 100
}

// eslint-disable-next-line promise/param-names
const sleep = ms => new Promise(r => setTimeout(r, ms))

export async function execute ({
    func, scope, objs, board, interrupt, walls, configs = {
        segment: {
            strokeWidth: () => size(0.5),
            strokeColor: 'lightblue',
            highlightStrokeColor: 'lightblue'
        },
        point: {
            strokeColor: 'rgb(190, 100, 20)',
            highlightStrokeColor: 'rgb(190, 100, 20)',
            fillColor: 'rgb(190, 100, 20)',
            highlightFillColor: 'rgb(190, 100, 20)',

            size: () => size(0.55),
            name: ''
        }
    }
}) {
    let x = 0.5; let y = 0.5
    const mascot = board.create('point', [x, y], {
        ...configs.point,
        size: () => size(1.2)
    })

    objs.push([mascot])
    const spd = 100

    async function move (d, axis) {
        const a = board.create('point', [x, y], configs.point)
        const b = board.create('point', [x, y], configs.point)
        const segment = board.create('segment', [a, b], configs.segment)

        const dx = axis === 'x' ? d : 0
        const dy = axis === 'y' ? d : 0

        objs.push(...[a, b, segment])

        const sx = axis === 'x' ? (d < 0 ? -0.5 : 0.5) : 1
        const sy = axis === 'y' ? (d < 0 ? -0.5 : 0.5) : 1

        const fx = function (a, b) {
            return sx < 0 ? (a >= b) : (a <= b)
        }
        const fy = function (a, b) {
            return sy < 0 ? (a >= b) : (a <= b)
        }

        for (let cx = x; fx(cx, x + dx); cx += sx) {
            for (let cy = y; fy(cy, y + dy); cy += sy) {
                if (interrupt()) {
                    return
                }

                if (cx % 1 < 0.1) {
                    if ([[cx, Math.floor(cy)], [cx, Math.ceil(cy)]] in walls) {
                        interrupt = function () {
                            alert('Стена!')
                            return true
                        }
                    }
                }

                if (cy % 1 < 0.1) {
                    if ([[Math.floor(cx), cy], [Math.ceil(cx), cy]] in walls) {
                        interrupt = function () {
                            alert('Стена!')
                            return true
                        }
                    }
                }

                b.moveTo([cx, cy], spd)
                mascot.moveTo([cx, cy], spd)

                // eslint-disable-next-line @typescript-eslint/no-empty-function
                await sleep(spd)
            }
        }

        x += dx
        y += dy
    }

    func(scope = {
        ...scope,
        RIGHT: async function (d) {
            if (interrupt()) { return }
            await move(d, 'x')
        },
        UP: async function (d) {
            if (interrupt()) { return }
            await move(d, 'y')
        },
        LEFT: async function (d) {
            if (interrupt()) { return }
            await move(-d, 'x')
        },
        DOWN: async function (d) {
            if (interrupt()) { return }
            await move(-d, 'y')
        },
        blocked: function (d) {
            const [lx, ux] = [Math.floor(x), Math.ceil(x)]
            const [ly, uy] = [Math.floor(y), Math.ceil(y)]
            if (d === 'RIGHT') {
                return [[ux, ly], [ux, uy]] in walls
            }
            if (d === 'LEFT') {
                return [[lx, ly], [lx, uy]] in walls
            }
            if (d === 'UP') {
                return [[lx, uy], [ux, uy]] in walls
            }
            if (d === 'DOWN') {
                return [[lx, ly], [ux, ly]] in walls
            }
        }
    })
    return objs
}
