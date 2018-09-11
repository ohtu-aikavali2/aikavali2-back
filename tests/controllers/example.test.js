const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)

const testUrl = `${apiUrl}/example`

describe('example controller', () => {
  describe(testUrl, () => {
    test('GET', async () => {
      const response = await api.get(testUrl)
      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Hello worlddd!')
    })
  })
})

afterAll(() => {
  server.close()
})