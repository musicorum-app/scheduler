const Twit = require('twit')
const { crypto } = require('./utils')

module.exports = ({ user, theme, options }) => {
  const { token, secret } = user.twitter.tokens
  const access_token = crypto.decryptToken(token, process.env.TWITTER_CRYPTO)
  const access_token_secret = crypto.decryptToken(secret, process.env.TWITTER_CRYPTO)

  const Twitter = new Twit({
    access_token,
    access_token_secret,
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET
  })

  // options.user = user.lastfm.
}
