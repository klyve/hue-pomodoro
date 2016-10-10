"use strict"
module.exports = {
  time: {
    start: 0,
    stop: 0,
  },
  pause: {
    enabled: false,
    start: 0,
    stop: 0,
    time: 0
  },
  timer: undefined,
  stopCallback: undefined,
  start: function(endtime, callback) {
      if(!endtime || this.time.start > 0)
        this.stop()
      this.time.start = Date.now() / 1000
      this.time.stop = (Date.now() / 1000) + endtime
      this.stopCallback = callback
      this.tick()
      // Only call tick if there is no timer active
  },

  stop: function(complete) {
    clearTimeout(this.timer)
    let x = {
      timestart: this.time.start,
      timeend: this.time.stop,
      completed: complete || false
    }
    this.time.start = this.time.stop = this.pause.time = this.pause.start = this.pause.stop = 0
    this.pause.enabled = false
    if(typeof this.stopCallback === 'function')
      this.stopCallback(x, this)
  },

  startPause: function(time) {
    this.pause.enabled = true
    this.pause.start = time || (Date.now() / 1000)
  },
  stopPause: function(time) {
    if(!this.pause.enabled)
      return
    this.pause.enabled = false
    this.pause.time += (time || (Date.now() / 1000)) - this.pause.start

    this.tick()
  },
  timeLeft: function() {
    if(this.time.stop == 0)
      return 0;
    return this.time.stop - (Date.now() / 1000 - this.pause.time)
  },
  tick: function() {
    if(this.pause.enabled)
      return

    if(this.timeLeft() <= 0)
      return this.stop(true)


    this.timer = setTimeout(() => {
        this.tick()
    }, 100)
  }

}
