var app = require('app')
var BrowserWindow = require('browser-window')
var server = require('child_process').fork('./index.js', ['-p', '3333'])

app.on('ready', function () {
  var browser = new BrowserWindow({ width: 1024, height: 768})
  browser.loadURL('file://' + __dirname + '/electron-splash.html')
  setTimeout(start, 5000)
  setTimeout(reload, 7000)

  function start () {
    console.log('start')
    browser.loadURL('file://' + __dirname + '/electron-frame.html')
  }

  function reload () {
    console.log('reload')
    browser.reload()
  }
})

app.on('will-quit', function () {
  server.kill()
})