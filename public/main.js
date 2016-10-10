var ajax = {};
ajax.x = function () {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {
        }
    }
    return xhr;
};
ajax.parseQuery = function(data) {
  var query = [];
  for (var key in data) {
      query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
  }
  return query;
}
ajax.send = function (url, callback, method, data, async) {
    if (async === undefined) {
        async = true;
    }
    var x = ajax.x();
    x.open(method, url, async);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            callback(x.responseText)
        }
    };
    if (method == 'POST' || method == 'PUT') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function (url, data, callback, async) {
    var query = ajax.parseQuery(data)
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
};

ajax.post = function (url, data, callback, async) {
    var query = ajax.parseQuery(data)
    ajax.send(url, callback, 'POST', query.join('&'), async)
};
ajax.put = function (url, data, callback, async) {
  var query = ajax.parseQuery(data)
  ajax.send(url, callback, 'PUT', query.join('&'), async)
}

function addClass(ele, className) {
  if(ele.length) {
    for(var i = 0; i < ele.ength; i++) {
      ele[i].addClass(ele[i], className)
    }
    return;
  }
  if(ele.classList)
    ele.classList.add(className)
  else if (hasClass(ele, className)) ele.className += ' ' + className
}
function removeClass(ele, className) {
  if(ele == undefined)
    return;
  if(ele.classList)
    ele.classList.remove(className)
  else if (hasClass(ele, className))
    ele.className = ele.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ')
}

function hasClass(ele, className) {
  if (ele.classList)
      return ele.classList.contains(className)
  else
    return !!ele.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}










var Scene = {

  to: function(scene) {
      this.inactive()
      this.active(scene)
  },
  inactive: function() {
    var scenes = document.querySelector('.active')
    removeClass(scenes, 'active')
  },
  active: function(scene) {

    var scene = document.querySelector('.scene-'+scene)

    addClass(scene, 'active');
  }


}

Scene.to('home')





Router.navigate();
Router.add(/settings/, function() {
    Scene.to('settings')
}).add(/home/, function() {
    Scene.to('home')
}).add(/timermenu/, function() {
    Scene.to('timermenu')
}).add(/timer/, function() {
    Scene.to('timer')
}).add(/timer/, function() {
    console.log('about');
}).add(/finished/, function() {
    Scene.to('finished')
}).listen();








var _settings = {};
function parseSettings() {
  var ret = {};
  var inputs = document.querySelectorAll('.settings input')

  for(var i = 0; i < inputs.length; i++) {
    ret[inputs[i].name] = inputs[i].value
  }

  _settings = ret;
  return ret;
}
function getSettings() {
  return _settings;
}
function fetchSettings() {
  ajax.get('/settings', [], function(data) {
    var inputs = document.querySelectorAll('.settings input')
    var data = JSON.parse(data)
    for(var i = 0; i < inputs.length; i++) {
      inputs[i].value = data[inputs[i].name] || inputs[i].value;
    }
    _settings = data;
  })
}
fetchSettings();

function parseTime(t) {
  var sec_num = parseInt(t, 10)
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}

  return (hours+':'+minutes+':'+seconds)

}





function sceneChange(e) {

  attr = this.getAttribute('data-to')

  Router.navigate('/'+attr);

  e.preventDefault()
}
var scenebtns = document.querySelectorAll('.scene')
for(var i = 0; i < scenebtns.length; i++) {
  scenebtns[i].addEventListener('click',sceneChange,false)
}



















var b = document.querySelector('h1.time');

// Timer.start(10, function() {
//   b.innerHTML = parseTime(0);
// }, function(t) {
//
//   b.innerHTML = parseTime( Math.floor(t.timeLeft()) )
//
// });


(function() {
  // Init the timer if it's running
  ajax.get('/timer', {}, function(data) {
    var json = JSON.parse(data)

    if(!json.status)
      return

    Router.navigate('timer')
    Timer.resume(json, function() {
      console.log("Timer stopped: " + Date. now())
      b.innerHTML = parseTime(0);
    }, function(t) {
      b.innerHTML = parseTime( Math.floor(t.timeLeft()) )
    })


  })
})();

(function() {
  var testbtn = document.querySelector('.testbtn')
  testbtn.addEventListener('click',function(e) {

    ajax.post('/test', getSettings(), function() {
      console.log("Tested")
    })

    e.preventDefault()
    return false
  },false)

  var settingsbtn = document.querySelector('.savesettings')
  settingsbtn.addEventListener('click',function(e) {
    parseSettings();
    ajax.put('/settings', getSettings(), function() {
      console.log("saved settings")
    })

    e.preventDefault()
    return false
  },false)


  //---------------------------------------------------------------------------------------
  // Start the timer logic
  //---------------------------------------------------------------------------------------
  function timerStart(e) {
    var startTime = Date.now();
    var time = _settings[this.name];
    ajax.post('/timer/start', {type:this.name, time: startTime}, function() {
      console.log("Started timer!")
    })
    Timer.start(time*60, function() {
      console.log("Timer stopped: " + Date.now())
      b.innerHTML = parseTime(0);
    }, function(t) {

      b.innerHTML = parseTime( Math.floor(t.timeLeft()) )

    });

    e.preventDefault()
    return false
  }

  var startbtns = document.querySelectorAll('.timerstart')
  for(var i = 0; i < startbtns.length; i++) {
    startbtns[i].addEventListener('click',timerStart,false)
  }
  //---------------------------------------------------------------------------------------
  // Pause the timer logic
  //---------------------------------------------------------------------------------------

  var pausetimer = document.querySelector('.pausetimer')
  pausetimer.addEventListener('click',function(e) {

    var t = Timer.startPause()
    ajax.post('/timer/pause', {time: t}, function() {
      console.log("Stopped the timer")
    })
    e.preventDefault()
    return false
  },false)

  var unpausetimer = document.querySelector('.unpausetimer')
  unpausetimer.addEventListener('click',function(e) {

    var t = Timer.stopPause()
    ajax.post('/timer/unpause', {time: t}, function() {
      console.log("started the timer")
    })
    e.preventDefault()
    return false
  },false)







})();
