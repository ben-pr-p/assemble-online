module.exports = {
  add: (arr, el) => {
    const set = new Set(arr)
    set.add(el)
    return [...set]
  },
  delete: (arr, el) => {
    const set = new Set(arr)
    set.delete(el)
    return [...set]
  }
}
