// spatial.js — spatial hash grid for neighbor queries
// Merged from emergence + cosmic implementations

function SpatialGrid(cellSize) {
  this.cellSize = cellSize
  this.inv = 1 / cellSize
  this.cells = new Map()
}

SpatialGrid.prototype.clear = function() {
  this.cells.clear()
}

SpatialGrid.prototype._key = function(cx, cy) {
  return (cx & 0xFFFF) | ((cy & 0xFFFF) << 16)
}

SpatialGrid.prototype.insert = function(item) {
  const cx = (item.x * this.inv) | 0
  const cy = (item.y * this.inv) | 0
  const k = this._key(cx, cy)
  let cell = this.cells.get(k)
  if (!cell) { cell = []; this.cells.set(k, cell) }
  cell.push(item)
}

SpatialGrid.prototype.query = function(x, y, radius, out) {
  let count = 0
  const minCX = ((x - radius) * this.inv) | 0
  const maxCX = ((x + radius) * this.inv) | 0
  const minCY = ((y - radius) * this.inv) | 0
  const maxCY = ((y + radius) * this.inv) | 0

  for (let cx = minCX; cx <= maxCX; cx++) {
    for (let cy = minCY; cy <= maxCY; cy++) {
      const cell = this.cells.get(this._key(cx, cy))
      if (cell) {
        for (let i = 0, len = cell.length; i < len; i++) {
          out[count++] = cell[i]
        }
      }
    }
  }
  return count
}

// Array-based grid for index-based access (cosmic web style)
function IndexGrid(cellSize, w, h) {
  this.cellSize = cellSize
  this.cols = Math.ceil(w / cellSize) + 1
  this.rows = Math.ceil(h / cellSize) + 1
  this.cells = new Array(this.cols * this.rows)
  for (let i = 0; i < this.cells.length; i++) this.cells[i] = []
}

IndexGrid.prototype.clear = function() {
  for (let i = 0; i < this.cells.length; i++) this.cells[i].length = 0
}

IndexGrid.prototype.insert = function(idx, x, y) {
  const col = Math.floor(x / this.cellSize)
  const row = Math.floor(y / this.cellSize)
  if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
    this.cells[row * this.cols + col].push(idx)
  }
}

IndexGrid.prototype.forEachPair = function(callback) {
  const cols = this.cols, rows = this.rows, cells = this.cells

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ci = row * cols + col
      const cellA = cells[ci]
      if (cellA.length === 0) continue

      // self pairs
      for (let p = 0; p < cellA.length; p++) {
        for (let q = p + 1; q < cellA.length; q++) {
          callback(cellA[p], cellA[q])
        }
      }

      // neighbor cells (right, bottom-left, bottom, bottom-right)
      const nbs = []
      if (col + 1 < cols) nbs.push(ci + 1)
      if (row + 1 < rows) {
        if (col - 1 >= 0) nbs.push((row + 1) * cols + col - 1)
        nbs.push((row + 1) * cols + col)
        if (col + 1 < cols) nbs.push((row + 1) * cols + col + 1)
      }

      for (let ni = 0; ni < nbs.length; ni++) {
        const cellB = cells[nbs[ni]]
        for (let p = 0; p < cellA.length; p++) {
          for (let q = 0; q < cellB.length; q++) {
            callback(cellA[p], cellB[q])
          }
        }
      }
    }
  }
}
