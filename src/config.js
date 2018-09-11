const swaggerDoc = require('../swagger.json')

const isProduction = process.env.NODE_ENV === 'production'
if (!isProduction) {
  require('dotenv').config()
} else {
  swaggerDoc.host = 'cd-pipeline-skeleton.herokuapp.com'
  swaggerDoc.schemes = [ 'https' ]
}

let port = process.env.PORT

if (process.env.NODE_ENV === 'test') {
  port = process.env.TEST_PORT
}

module.exports = {
  port,
  swaggerDoc
}
