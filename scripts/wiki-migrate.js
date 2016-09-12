#!/usr/bin/env node

// persona identity to owner.json file converter

const _ = require('lodash')
const glob = require('glob')
const fs = require('fs')
const path = require('path')

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
}

var cc = require('config-chain')
var argv = require('optimist')
    .usage('Usage: $0')
    .options('d', {
      alias : 'data',
      describe : 'location of wiki file data',
      default : path.join(getUserHome(), '.wiki')
    })
    .options('s', {
      alias : 'status',
      describe : 'status directory name',
      default : 'status'
    })
    .options('id', {
      describe : 'the name of the owner identity file',
      default : 'owner.json'
    })
    .argv

const wikiDir = argv.d

glob('**/persona.identity', {cwd: wikiDir}, (err, files) => {
  _.forEach(files,  function(file) {
    console.log('found... ', file)
    var ownerFile = path.join(wikiDir, path.dirname(file),argv.id)
    var owner = {}
    fs.readFile(path.join(wikiDir, file), 'utf8', (err, ownerEmail) => {
      ownerEmail = ownerEmail.replace(/\r?\n|\r/, '')
      var ownerName = ownerEmail.substr(0, ownerEmail.indexOf('@'))
      ownerName = ownerName.split('.').join(' ').toLowerCase().replace(/(^| )(\w)/g, function(x) {return x.toUpperCase()})
      owner.name = ownerName
      owner.persona = { email: ownerEmail }
      console.log('saving ', owner, ' to ', ownerFile)
      fs.writeFile(ownerFile, JSON.stringify(owner), (err) => {
        if (err) throw err
      })
    })
  })
})
