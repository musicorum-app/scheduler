const mongoose = require('mongoose')
const User = require('./db/schemas/User.js')
const chalk = require('chalk')
const cron = require('node-cron')
const PublishTask = require('./PublishTask.js')

module.exports = class MusicorumScheduler {
  init () {
    this.connectDatabase()
  }

  async connectDatabase () {
    console.log(chalk.yellow(' CONNECTING TO DATABASE... '))
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    this.database = mongoose.connection
    this.database.on('error', console.error.bind(console, chalk.red(' DATABASE CONNECTION ERROR: ')))
    console.log(chalk.green(' DATABASE CONNECTED SUCCESSFULLY '))
    this.setupSchedulers()
  }

  async setupSchedulers () {
    const users = await User.find({})
    users.forEach(u => {
      if (u.twitter && u.lastfm) {
        u.schedules.forEach(sch => {
          const { time, name, timezone } = sch
          const { minute, hour } = this.getTime(time)

          cron.schedule(`${minute} ${hour} * * 6,7`, () => {
            PublishTask({ user: u, schedule: sch })
            console.log(chalk.magenta(' TASK RUN ') + 'schedule ' + chalk.cyan(name) + ' ran from user ' + chalk.cyan(u._id))
          }, {
            timezone
          })
          console.log(chalk.yellow(' NEW SCHEDULE ADDED ') + 'for schedule ' + chalk.cyan(name) + ' from user ' + chalk.cyan(u._id) + ' with cycle ' +
            chalk.cyan(sch.schedule) + ' at ' + chalk.cyan(`${hour}h ${minute}m (${timezone})`))
        })
      }
    })
  }

  getTime (minutes) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes - (60 * hour)
    return { hour, minute }
  }
}
