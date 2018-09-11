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

// CONTROLLERS
const apiUrl = '/api/v1'
const exampleController = require('./controllers/example')
const questionController = require('./controllers/questionController')
app.use(`${apiUrl}/example`, exampleController)
app.use(`${apiUrl}/questions`, questionController)
app.use('/', swagger.serve, swagger.setup(config.swaggerDoc))

// DATABASE
mongoose
  .connect(config.dbUri)
  .then(() => {
    console.log('connected to database successfully')
  })
  .catch((e) => {
    console.error(e)
  })

// CREATE SERVER
const server = http.createServer(app)
server.listen(config.port, () => {
  console.log(`Listening on port ${ config.port }`)
})

server.on('close', () => {
  mongoose.connection.close()
})

module.exports = {
  app,
  server,
  apiUrl
}