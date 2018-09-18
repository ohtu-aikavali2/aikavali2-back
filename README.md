# aikavali-back
[![Build Status](https://travis-ci.org/ohtu-aikavali/aikavali-back.svg?branch=master)](https://travis-ci.org/ohtu-aikavali/aikavali-back)
[![codecov](https://codecov.io/gh/ohtu-aikavali/aikavali-back/branch/master/graph/badge.svg)](https://codecov.io/gh/ohtu-aikavali/aikavali-back)
[![dependencies Status](https://david-dm.org/ohtu-aikavali/aikavali-back/status.svg)](https://david-dm.org/ohtu-aikavali/aikavali-back)
[![Maintainability](https://api.codeclimate.com/v1/badges/7772d770430260399078/maintainability)](https://codeclimate.com/github/ohtu-aikavali/aikavali-back/maintainability)


## Start  
Install dependencies:

```npm install```

Create .env file:

```touch .env```

Add two environmental variables into the .env file:

```
PORT=X
TEST_PORT=Y
DB_URI=URL_TO_MONGO_DB
SECRET=Z
```

Start the project:

1. ```npm run watch``` for development
2. ```npm start``` for production

## Additional scripts
Tests:

```npm test```

Linter:

```npm run lint```
