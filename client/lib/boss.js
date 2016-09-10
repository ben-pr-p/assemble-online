class Boss {
  constructor () {
    this.events = {}

    this.worker = new SharedWorker('/workers/client/workers/foreman.js')
    this.worker.port.onmessage = this.handleMessage.bind(this)
    this.worker.port.onerror = this.handleError.bind(this)
    this.worker.onerror = this.handleError.bind(this)
    this.worker.port.start()
  }

  on (event, fn, caller) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push({fn, caller})
  }

  off (event, fn) {
    this.events[event] = this.events[event].filter(e => e.fn != fn)
  }

  offByCaller (event, caller) {
    this.events[event] = this.events[event].filter(e => e.caller != caller)
  }

  offAllByCaller (caller) {
    for (let event in this.events) {
      this.events[event] = this.events[event].filter(e => e.caller != caller)
    }
  }

  handleMessage (msg) {
    if (!msg.data.event) {
      throw new Error('Worker posted message without event descriptor: %j', msg.data)
    }

    if (msg.data.event == 'error') {
      return this.handleError(msg.data.data)
    }

    let handled = false
    if (this.events[msg.data.event]) {
      this.events[msg.data.event].forEach(ev => {
        handled = true
        ev.fn(msg.data.data)
      })
    }

    if (!handled) {
      console.log(msg.data)
      throw new Error(`Received event ${JSON.stringify(msg.data)} with no handler`)
    }
  }

  handleError (err) {
    console.log(err)
    console.log(arguments)
    throw new Error(`Worker encountered error: ${JSON.stringify(err)}`)
  }

  post (event, data) {
    this.worker.port.postMessage({event, data})
  }
}

export default new Boss()
