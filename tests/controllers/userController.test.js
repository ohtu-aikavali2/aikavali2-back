const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const User = require('../../src/models/user')
const testUrl = `${apiUrl}/user`

describe('user controller', () => {
  let token
  beforeEach(async () => {
    await User.deleteMany()
    const response = await api
      .post(`${testUrl}/generate`)
    token = response.body.token
  })

  describe(`${testUrl}/login`, () => {
    test('POST', async () => {
      const user = { accessToken: '123' }
      const response = await api
        .post(`${testUrl}/login`)
        .send({ user })
      expect(response.body.error).toBeDefined()
    })
  })

  describe(`${testUrl}/generate`, () => {
    test('POST', async () => {
      const response = await api
        .post(`${testUrl}/generate`)
      expect(response.body.token.length).toBeGreaterThan(0)
    })
  })

  describe(`${testUrl}/verifyToken`, () => {
    test('GET', async () => {
      let response = await api
        .get(`${testUrl}/verifyToken`)
        .set('Authorization', `bearer ${ token }`)
      expect(response.body.message).toBe('Token verified!')

      response = await api
        .get(`${testUrl}/verifyToken`)
      expect(response.body.error).toBe('token missing')

      response = await api
        .get(`${testUrl}/verifyToken`)
        .set('Authorization', 'bearer lalala')
      expect(response.body.message).toBe('There was something wrong with the token!')
    })
  })
})

afterAll(() => {
  server.close()
})