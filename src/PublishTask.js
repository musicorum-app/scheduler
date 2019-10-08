const Twit = require('twit')
const { crypto } = require('./utils')
const LFM = require('lastfm-node-client')

const LastFM = new LFM(process.env.LASTFM_KEY, process.env.LASTFM_SECRET)

module.exports = async ({ user, theme, options }) => {
  // TODO: Finish this
  try {
    const { token, secret } = user.twitter.tokens
    const { sessionKey } = user.lastfm
    const access_token = crypto.decryptToken(token, process.env.TWITTER_CRYPTO)
    const access_token_secret = crypto.decryptToken(secret, process.env.TWITTER_CRYPTO)
    const session_key = crypto.decryptToken(sessionKey, process.env.LASTFM_CRYPTO)

    const Twitter = new Twit({
      access_token,
      access_token_secret,
      consumer_key: process.env.TWITTER_API_KEY,
      consumer_secret: process.env.TWITTER_API_SECRET
    })

    const lastfmUser = await new Promise((resolve, reject) => {
      LastFM.userGetInfoAuthenticated((err, data) => {
        if (err) reject(err)
        resolve(data.user.name)
      }, session_key)
    })

    console.log(lastfmUser)

    options.user = lastfmUser
  } catch (e) {
    console.error(e)
  }
}
