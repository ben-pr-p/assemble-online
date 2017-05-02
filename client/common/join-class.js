const toArray = unknown =>
  (Array.isArray(unknown)
    ? unknown
    : typeof unknown == 'string' ? [unknown] : [])

export default (input, base) => toArray(input).concat(toArray(base)).join(' ')
