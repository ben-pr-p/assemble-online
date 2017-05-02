export default (prevProps, prevState, nextProps, nextState) => {
  let shouldUpdate = false

  if (prevProps !== nextProps) {
    Object.keys(nextProps).forEach(p => {
      if (nextProps[p] !== prevProps[p]) shouldUpdate = true
    })
  }

  if (prevState !== nextState) {
    Object.keys(nextState).forEach(s => {
      if (nextState[s] !== prevState[s]) shouldUpdate = true
    })
  }

  return shouldUpdate
}
