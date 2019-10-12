const mongoose = require('mongoose')
const Schedule = require('./Schedule.js')

const TwitterAccount = new mongoose.Schema({
  id: String,
  accessToken: String,
  accessSecret: String
})

const LastfmAccount = new mongoose.Schema({
  sessionKey: String
})

const User = new mongoose.Schema({
  twitter: TwitterAccount,
  lastfm: LastfmAccount,
  schedules: [Schedule]
})

module.exports = mongoose.model('User', User)
module.exports.Schedule = mongoose.model('Schedule', Schedule)
module.exports.TwitterAccount = mongoose.model('TwitterAccount', TwitterAccount)
module.exports.LastfmAccount = mongoose.model('LastfmAccount', LastfmAccount)
