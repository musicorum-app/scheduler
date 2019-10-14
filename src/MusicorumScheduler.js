const mongoose = require('mongoose')
const User = require('./db/schemas/User.js')
const chalk = require('chalk')
const cron = require('node-cron')
const express = require('express')
const app = express()
const PublishTask = require('./PublishTask.js')
const tokenMiddleware = require('./utils/tokenMiddleware.js')
const responses = require('./utils/responses.js')

module.exports = class MusicorumScheduler {
  async init () {
    this.port = process.env.PORT
    await this.connectDatabase()
    app.use(express.json())

    await this.routes(app)

    app.listen(this.port, () =>
      console.log(chalk.bgGreen(' SUCCESS ') + ' Web server started on port ' + chalk.blue(this.port)))
  }

  async connectDatabase () {
    console.log(chalk.yellow(' CONNECTING TO DATABASE... '))
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log(chalk.green(' DATABASE CONNECTED SUCCESSFULLY '))
        this.setupSchedulers()
      })
      .catch(e => {
        console.log(chalk.red(' DATABASE CONNECTION ERROR '))
        console.error(e)
      })
    this.database = mongoose.connection
    this.database.on('error', console.error.bind(console, chalk.red(' DATABASE ERROR: ')))
  }

  async setupSchedulers () {
    const users = await User.find({})
    this.tasks = {}
    users.forEach(u => {
      if (u.twitter && u.lastfm) {
        u.schedules.forEach(sch => this.addSchedule(sch, u))
      }
    })
  }

  addSchedule (schedule, user) {
    const { time, name, timezone } = schedule
    const { minute, hour } = this.getTime(time)

    this.tasks[schedule._id] = cron.schedule(`${minute} ${hour} * * 7`, () => {
      PublishTask({ user, schedule })
      console.log(chalk.magenta(' TASK RUN ') + 'schedule ' + chalk.cyan(name) + ' (' + chalk.blue(schedule._id) + ')')
    }, {
      timezone
    })
    console.log(chalk.yellow(' NEW SCHEDULE ADDED ') + 'for schedule ' + chalk.cyan(name) + ' (' + chalk.blue(schedule._id) + ') with cycle ' +
      chalk.cyan(schedule.schedule) + ' at ' + chalk.cyan(`${hour}h ${minute}m (${timezone})`))
  }

  routes (route) {
    route.post('/tasks/:user/:id', async (req, res) => {
      try {
        const id = req.params.id
        const userId = req.params.user
        const user = await User.findById(userId)
        if (this.tasks[id]) {
          res.status(400).json(responses.SCHEDULE_ALREADY_RUNNING)
          return
        }
        if (!user) {
          res.status(404).json(responses.USER_NOT_FOUND)
        } else {
          const schedule = user.schedules.id(id)
          if (!schedule) {
            res.status(404).json(responses.SCHEDULE_NOT_FOUND)
          } else {
            this.addSchedule(schedule, user)
            res.json({ success: true })
          }
        }
      } catch (err) {
        console.log(chalk.red(' REQUEST ERROR '))
        console.error(err)
        res.status(500).json(responses.INTERNAL_ERROR)
      }
    })

    route.delete('/tasks/:id', tokenMiddleware, async (req, res) => {
      const task = this.tasks[req.params.id]
      if (!task) {
        res.status(404).json(responses.TASK_NOT_FOUND)
      } else {
        task.destroy()
        delete this.tasks[req.params.id]
        console.log(chalk.red(' DELETING TASK ') + 'from schedule ' + chalk.cyan(req.params.id))
        res.status(200).json({ success: true })
      }
    })

    route.all('*', (_, res) => {
      res.status(404).json(responses.ENDPOINT_NOT_FOUND)
    })
  }

  getTime (minutes) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes - (60 * hour)
    return { hour, minute }
  }
}
