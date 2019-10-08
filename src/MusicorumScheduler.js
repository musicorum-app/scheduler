const mongoose = require('mongoose')
const SchedulerSchema = require('./db/schemas/Scheduler.js')
const UserSchema = require('./db/schemas/User.js')
const chalk = require('chalk')

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
    chalk.red(' FAILED TO FETCH SCHEDULERS FROM DATABASE ')
    SchedulerSchema.find({}, (err, schedulers) => {
      if (err) {
        console.log(chalk.red(' FAILED TO FETCH SCHEDULERS FROM DATABASE '))
      }

      console.log(schedulers)
    })
  }
}
