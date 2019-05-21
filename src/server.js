// IMPORTS
const http = require('http')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')
const swagger = require('swagger-ui-express')
const mongoose = require('mongoose')
const config = require('./config')
const app = require('express')()

// MIDDLEWARE
app.use(cors())
app.use(bodyParser.json())
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('common'))
}
app.use(helmet())
app.use(compression())
app.use((req, res, next) => {
  const auth = req.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    req.body.token = auth.substring(7)
  } else {
    req.body.token = null
  }
  next()
})

// CONTROLLERS
const apiUrl = '/api/v1'
const questionController = require('./controllers/questionController')
const userController = require('./controllers/userController')
const answerController = require('./controllers/answerController')
const questionReviewController = require('./controllers/questionReviewController.js')
const courseController = require('./controllers/courseController')
const groupController = require('./controllers/groupController')
const flagController = require('./controllers/flagController')
const conceptController = require('./controllers/conceptController')
app.use(`${apiUrl}/questions`, questionController)
app.use(`${apiUrl}/user`, userController)
app.use(`${apiUrl}/answer`, answerController)
app.use(`${apiUrl}/reviews`, questionReviewController)
app.use(`${apiUrl}/courses`, courseController)
app.use(`${apiUrl}/groups`, groupController)
app.use(`${apiUrl}/flags`, flagController)
app.use(`${apiUrl}/concepts`, conceptController)
app.use(`${apiUrl}`, swagger.serve, swagger.setup(config.swaggerDoc))
app.get('/', (req, res) => res.status(404).send(`This isn't the page you're looking for! Please go to <a href=${apiUrl}>${apiUrl}</a>`))

// DATABASE
mongoose
  .connect(config.dbUri, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to database successfully')
  })
  .catch((e) => {
    console.error(e)
  })
mongoose.set('useFindAndModify', false)

// CREATE SERVER
const server = http.createServer(app)
server.listen(config.port, () => {
  console.log(`Listening on port ${config.port}`)
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app,
  server,
  apiUrl
}
