class KeyManager {
  constructor () {
    this.events = {}
    window.addEventListener('keypress', this.onKeyPress.bind(this))
  }

  register (keyCode, method, registree) {
    if (!this.events[keyCode]) this.events[keyCode] = []

    this.events[keyCode].push({method, registree})
  }

  unregisterOne (keyCode, registree) {
    if (this.events[keyCode]) {
      let registreeMethod = this.events[keyCode].filter(e => e.registree == registree)[0]
      if (registreeMethod) {
        this.events[keyCode] = this.events[keyCode].filter(e => e.registree != registree)
        return true
      }
      else {
        return false
      }
    }

    return false
  }

  unregisterAll (registree) {
    for (let kc in this.events) {
      this.events[kc] = this.events[kc].filter(e => e.registree != registree)
    }
  }

  onKeyPress (ev) {
    if (this.events[ev.keyCode]) {
      this.events[ev.keyCode].forEach(e => {
        e.method(ev)
      })
    }
  }
}

export default new KeyManager()
