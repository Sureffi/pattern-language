// noise.js — 2D Perlin noise with optional seeding
// Merged from flowfield + terrain implementations

class Noise {
  constructor(seed) {
    this.perm = new Uint8Array(512)
    const p = new Uint8Array(256)
    for (let i = 0; i < 256; i++) p[i] = i

    let s = seed || Math.random() * 65536
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647
      const j = s % (i + 1)
      ;[p[i], p[j]] = [p[j], p[i]]
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255]
  }

  get(x, y) {
    const perm = this.perm
    const xi = Math.floor(x), yi = Math.floor(y)
    const X = xi & 255, Y = yi & 255
    const xf = x - xi, yf = y - yi

    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10)
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10)

    const aa = perm[perm[X] + Y]
    const ba = perm[perm[X + 1] + Y]
    const ab = perm[perm[X] + Y + 1]
    const bb = perm[perm[X + 1] + Y + 1]

    const xf1 = xf - 1, yf1 = yf - 1

    function g(hash, gx, gy) {
      const h = hash & 3
      const gu = h < 2 ? gx : gy
      const gv = h < 2 ? gy : gx
      return ((h & 1) ? -gu : gu) + ((h & 2) ? -gv : gv)
    }

    const g00 = g(aa, xf, yf)
    const g10 = g(ba, xf1, yf)
    const g01 = g(ab, xf, yf1)
    const g11 = g(bb, xf1, yf1)

    return g00 + u * (g10 - g00) + v * (g01 - g00) + u * v * (g00 - g10 - g01 + g11)
  }

  fbm3(x, y) {
    return (this.get(x, y) + this.get(x * 2, y * 2) * 0.5 + this.get(x * 4, y * 4) * 0.25) * 0.5714285714285714
  }

  fbm4(x, y) {
    return (this.get(x, y) + this.get(x * 2, y * 2) * 0.5 + this.get(x * 4, y * 4) * 0.25 + this.get(x * 8, y * 8) * 0.125) * 0.5333333333333333
  }
}
