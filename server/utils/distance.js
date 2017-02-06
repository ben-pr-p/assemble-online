module.exports = ([x1, y1], [x2, y2]) => {
  console.log([x1, y1]); console.log([x2, y2])
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}
