const mongoose = require('mongoose')

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
  lastfm: LastfmAccount
})

module.exports = mongoose.model('User', User)
