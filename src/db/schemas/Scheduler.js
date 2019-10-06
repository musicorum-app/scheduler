const { Schema } = require('mongoose')

module.exports = new Schema({
  id: String,
  user: String,
  schedule: {
    type: String,
    enum: ['MONTHY', 'WEEKLY']
  },
  time: Number,
  timezone: String,
  theme: String,
  themeOptions: Object
})
