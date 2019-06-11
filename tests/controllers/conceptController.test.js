const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const Concept = require('../../src/models/concept')
const User = require('../../src/models/user')
const testUrl = `${apiUrl}/concepts`

describe('concept controller', () => {
  let token
  let user

  beforeEach(async () => {
    //Remove all DB entities
    await Concept.deleteMany()
    await User.deleteMany()

    //Generate a user
    const response = await api
      .post(`${apiUrl}/user/generate`)
    token = response.body.token

    user = await User.findOne()

    //Create some concepts
    const concept1 = new Concept({ name: 'for-loop', user })
    await concept1.save()
    const concept2 = new Concept({ name: 'else', user })
    await concept2.save()
  })

  describe('/', () => {
    test('GET', async () => {
      //All concepts are returned
      const response = await api
        .get(testUrl)
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(2)
    })

    test('POST', async () => {
      //A new concept is created
      let response = await api
        .post(testUrl)
        .send({ name:'new', user: user.id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(201)
      expect(response.body.name).toBe('new')
      const foundConcept = await Concept.findOne({ name: 'new' })
      expect(foundConcept).toBeDefined()

      //Validation
      response = await api
        .post(testUrl)
        .send( { name: '' } )
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('params missing')

      //The added concept is found in the database
      response = await api
        .get(testUrl)
      expect(response.body.length).toBe(3)

    })
  })
})

afterAll(() => {
  server.close()
})
