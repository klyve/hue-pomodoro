"use strict";
const express = require('express')
const Hue = require('philips-hue')
const jade = require('jade')
const bodyParser = require('body-parser')
const Timer = require('./timer')

let hue = new Hue();
let tmphue = new Hue();
let app = express();



let currentSettings = {
  bridge: "10.0.0.137",
  username: "hxNRLoGYGMjtCdiBwgihuKqpKVT4-yH8el0hsgSY",
  lights: [1],
  pomodoro: 0.1,
  shortbreak: 5,
  longbreak: 10,
  tolongbreak: 4
}


function enableSettings(bridge, settings) {
  bridge.bridge = settings.bridge;
  bridge.username = settings.username;
}

function parseLights(lights) {
  // Trim all whitespace
  lights = lights.replace(/ /g,'')
  return lights.split(',').map( n => parseInt(n) )
}


enableSettings(hue, currentSettings)












app.set('view engine', 'jade');
app.use(express.static('public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())




app.get('/timer', (req, res) => {

  let data = {
    status: (Timer.timeLeft() > 0) ? true:false,
    time: Timer.time,
    pause: Timer.pause
  }

  res.send(JSON.stringify(data));

})

app.post('/timer/start', (req, res) => {

  let timeframe = currentSettings[req.body.type]
  console.log("Timer started for " + timeframe* 60 + "seconds")
  Timer.start(timeframe * 60, function(x) {
    console.log("Timer stopped: " + Date.now())
  });

  res.send();


})

app.post('/timer/pause', (req, res) => {
  Timer.startPause(req.body.time);
  res.send();
})
app.post('/timer/unpause', (req, res) => {
  Timer.stopPause(req.body.time);
  res.send();
})
app.post('/timer/stop', (req, res) => {

  Timer.stop();
  res.send();

})

// Test the lights
app.post('/test', (req, res) => {

  let lights = parseLights(req.body.lights)
  enableSettings(tmphue, req.body)
  lights.forEach((i) => {
    tmphue.light(i).on()
    tmphue.light(i).setState({hue: 30000, sat: 250, bri: 250})
    setTimeout( () => tmphue.light(i).off(), 1200)
  })

  res.send()
});

app.put('/settings', (req, res) => {
  // Save the settings
  for(let o in currentSettings) {
    if(o === "lights")
      continue;
    currentSettings[o] = req.body[o] || currentSettings[o]
  }
  currentSettings.lights = parseLights(req.body.lights);
  res.send("Saved")
})

app.get('/settings', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(currentSettings))
})


app.get('*', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});





app.listen(process.env.port || 3000, (x,y) => {
  console.log('Magic on port 3000!');
});
