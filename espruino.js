const wifi = require('Wifi');
const http = require("http");
const flexPin = 0;
const back = D13;
let started = true;

pinMode(D5, 'input_pullup');

let value = 0;
let initValue = 0;

let stats = { mistakes: 0, mistakeTime: 0 };
let mistake = false;

const calibrate = () => {
  initValue = value;
};

setWatch(() => {
  console.log("Button pressed");
initValue = value;
}, D5, { repeat: true, edge: 'rising', debounce: 50 });

setInterval(() => {
  value = analogRead(flexPin) * 1000;

  if (started === true) {
    let changeValue = Math.abs(initValue - value);
    if (changeValue >= 2) {
      digitalWrite(back, true);
      if(mistake === false){
        mistake = true;
        stats.mistakes ++;
      }
    } else {
      digitalWrite(back, false);
      if(mistake === true){
        mistake = false
      }
    }
  }
}, 100);

function router(req, res) {
  const a = url.parse(req.url, true);
  if(a.pathname === "/start"){
    started = true;
    calibrate();
    vibrate(back, 200, 1000);
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    } );
    res.end(JSON.stringify("started"));
  }
  if(a.pathname === "/end"){
    started = false;
    digitalWrite(back, false);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(JSON.stringify(stats));
  }
}

const vibrate = (pin, interval, time) => {
  let on = false;
  const blink = setInterval(function() {
    on = !on;
    digitalWrite(pin, on);
  }, interval);
  setTimeout(() => {clearInterval(blink);}, time);
};

function startServer () {
  const port = 8088;
  console.log("Listening on " + wifi.getIP().ip + ":" + port);
  http.createServer(router).listen(port);
}

if(wifi) {
  wifi.startAP('BetterSelf', { password: 'xxx', authMode: 'wpa2' }, startServer);

} else {
  startServer();
}
