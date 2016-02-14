var app = require('app')
var BrowserWindow = require('browser-window')
var server = require('child_process').fork('./index.js')

app.on('ready', function () {
  var browser = new BrowserWindow({ width: 1024, height: 768 })
  browser.loadURL('file://' + __dirname + '/electron-frame.html')
})

app.on('will-quit', function () {
  server.kill()
})