const Twit = require('twit')
const { crypto } = require('./utils')
const LFM = require('lastfm-node-client')
const fetch = require('node-fetch')
const Run = require('./db/schemas/Run.js')
const FormData = require('form-data')
const Sentry = require('@sentry/node')

Sentry.init({ dsn: process.env.SENTRY_DSN })

module.exports = async ({ user, schedule }) => {
  const { themeOptions: options, theme, text } = schedule
  const startDate = new Date()
  try {
    let { accessToken, accessSecret } = user.twitter
    let { sessionKey } = user.lastfm
    accessToken = crypto.decryptToken(accessToken, process.env.TWITTER_CRYPTO)
    accessSecret = crypto.decryptToken(accessSecret, process.env.TWITTER_CRYPTO)
    sessionKey = crypto.decryptToken(sessionKey, process.env.LASTFM_CRYPTO)

    const Twitter = new Twit({
      access_token: accessToken,
      access_token_secret: accessSecret,
      consumer_key: process.env.TWITTER_API_KEY,
      consumer_secret: process.env.TWITTER_API_SECRET
    })

    const lfm = new LFM(process.env.LASTFM_KEY, process.env.LASTFM_SECRET, sessionKey)
    const lfmUser = await lfm.userGetInfo()

    console.log(lfmUser.user.name)

    options.user = lfmUser.user.name

    const body = { theme, options }

    const run = {
      schedule: schedule._id
    }

    await fetch(`${process.env.GENERATOR_URL}/generate`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
      .then(res => res.json())
      .then(response => {
        const { base64 } = response

        Twitter.post('media/upload', { media_data: base64.slice(23) }, (err, data) => {
          if (err) {
            console.error(err)
            run.status = 'ERROR'
            run.message = err
            new Run(run).save()
            return
          }
          const mediaIdStr = data.media_id_string
          const altText = 'Powered by @musicorumapp / https://musicorumapp.com'
          const metaParams = { media_id: mediaIdStr, alt_text: { text: altText } }

          Twitter.post('media/metadata/create', metaParams, (err) => {
            if (err) {
              console.error(err)
              run.status = 'ERROR'
              run.message = err
              new Run(run).save()
              return
            }
            const params = { media_ids: [mediaIdStr], status: text }

            Twitter.post('statuses/update', params, (err, data) => {
              if (err) {
                console.error(err)
                run.status = 'ERROR'
                run.message = err
                new Run(run).save()
                return
              }
              console.log('SCHEDULE TWEET ID ' + data.id_str)

              doRun(base64, data, schedule, startDate)
            })
          })
        })
      })
  } catch (e) {
    Sentry.captureException(e)
    console.error(e)
  }
}

function doRun (imageb64, tweetData, schedule, startDate) {
  const form = new FormData()
  form.append('image', imageb64)
  fetch('https://api.imgur.com/3/upload', {
    method: 'POST',
    body: form,
    headers: { Authorization: `Client-ID ${process.env.IMGUR_CLIENT}`, ...form.getHeaders() }
  })
    .then(res => res.json())
    .then(res => {
      const run = {
        startTime: startDate.getTime(),
        endTime: new Date().getTime(),
        schedule: schedule._id,
        image: res.data.link,
        status: 'SUCCESS',
        message: 'Success run.',
        tweetId: tweetData.id_str
      }
      new Run(run).save()
    })
}
