# aikavali-back
[![Build Status](https://travis-ci.org/ohtu-aikavali2/aikavali2-back.svg?branch=master)](https://travis-ci.org/ohtu-aikavali2/aikavali2-back)


## Start  
Install dependencies:

```npm install```

Create .env file:

```touch .env```

Add two environmental variables into the .env file:

```
PORT=X
TEST_PORT=Y
DB_URI_DEV=URL_TO_MONGO_DB_DEV
DB_URI_TEST=URL_TO_MONGO_DB_TEST
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
