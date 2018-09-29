const swaggerDoc = require('../swagger.json')

const isProduction = process.env.NODE_ENV === 'production'
if (!isProduction) {
  require('dotenv').config()
} else {
  swaggerDoc.host = 'aikavali-back.herokuapp.com'
  swaggerDoc.schemes = [ 'https' ]
}

let port = process.env.PORT
let dbUri = process.env.DB_URI

if (process.env.NODE_ENV === 'test') {
  port = process.env.TEST_PORT
  dbUri = process.env.DB_URI_TEST
}

module.exports = {
  port,
  swaggerDoc,
  dbUri
}
