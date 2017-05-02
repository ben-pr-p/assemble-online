const SEGMENT = 6

export default (pos, trans, windim) => {
  const curr = pos + trans
  const chunk = windim / SEGMENT

  return curr < chunk || windim - curr < chunk
}
