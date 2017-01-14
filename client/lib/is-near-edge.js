const SEGMENT = 6

export default (pos, trans, windim) => {
  const curr = pos + trans
  const edge = windim / SEGMENT

  return (
    curr < edge
      ||
    curr > (windim - edge)
  )
}
