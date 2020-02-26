const responses = require('./responses.js')

module.exports = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json(responses.INVALID_TOKEN)
  }

  if (token === process.env.SCHEDULER_TOKEN) {
    next()
  } else {
    res.status(401).json(responses.INVALID_TOKEN)
  }
}
