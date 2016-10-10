(function(window, undefined) {

  var Timer = {
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
    tickCallback: undefined,
    start: function(endtime, sCallback, tCallback, pauseData) {
        if(this.time.start > 0)
          this.stop()
        if(pauseData)
          this.pause = pauseData

        this.time.start = Date.now() / 1000
        this.time.stop = (Date.now() / 1000) + endtime
        this.stopCallback = sCallback
        this.tickCallback = tCallback

        this.tick()
    },
    resume: function(time, sCallback, tCallback) {
        this.stop()
        this.pause = time.pause || this.pause;
        this.time = time.time || this.time;

        this.stopCallback = sCallback
        this.tickCallback = tCallback


        // Call the tick callback once
        if(typeof this.tickCallback === 'function')
          this.tickCallback(this)

        this.tick()
    },

    stop: function(complete) {
      clearTimeout(this.timer)
      var x = {
        timestart: this.time.start,
        timeend: this.time.stop,
        completed: complete || false
      }
      this.time.start = this.time.stop = this.pause.time = 0
      this.pause.enabled = false
      if(typeof this.stopCallback === 'function')
        this.stopCallback(x, this)
    },

    startPause: function() {
      this.pause.enabled = true;
      this.pause.start = Date.now() / 1000
      return this.pause.start
    },
    stopPause: function() {
      if(!this.pause.enabled)
        return
      var t = (Date.now() / 1000)
      this.pause.enabled = false
      this.pause.time += t - this.pause.start
      this.tick()
      return t
    },

    timeLeft: function() {
      if(this.time.stop == 0)
        return 0;
      var t = this.pause.time
      var now = (Date.now() / 1000)
      if(this.pause.enabled)
          t += now - this.pause.start
      return this.time.stop - (now - t)
    },

    tick: function() {
      if(this.pause.enabled)
        return
      if(this.timeLeft() <= 0)
        return this.stop(true)

      if(typeof this.tickCallback === 'function')
        this.tickCallback(this)

      var that = this;
      this.timer = window.setTimeout(function() {
        that.tick()
      }, 100)
    }

  }


  window.Timer = Timer


})(this)
