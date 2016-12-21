import Emitter from 'component-emitter'

class Boss {
  constructor () {
    this.emitter = new Emitter()
    this.callerFns = {}

    this.worker = new SharedWorker('/workers/foreman.js')
    this.worker.port.onmessage = this.handleMessage.bind(this)
    this.worker.port.onerror = this.handleError
    this.worker.onerror = this.handleError
    this.worker.port.start()
  }

  on (event, fn, caller) {
    this.emitter.on(event, fn)
    this.callerFns[caller] = this.callerFns[caller] != undefined
      ? this.callerFns[caller].concat([fn])
      : [fn]
  }

  off (event, fn) {
    if (typeof fn != 'function') throw new Error('send parameter to off must be a function')
    this.emitter.off(event, fn)
  }

  offByCaller (event, caller) {
    for (let fn in this.callerFns[caller]) {
      this.emitter.off(event, fn)
    }
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

    this.emitter.emit(msg.data.event, msg.data.data)
  }

  handleError (err, args) {
    throw new Error(`Worker encountered error: ${JSON.stringify(err)}`)
  }

  post (event, data) {
    this.worker.port.postMessage({event, data})
  }
}

export default new Boss()
