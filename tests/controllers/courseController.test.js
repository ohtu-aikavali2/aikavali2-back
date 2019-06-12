const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const Course = require('../../src/models/course')
const User = require('../../src/models/user')
const testUrl = `${apiUrl}/courses`

describe('course controller', () => {
  let token

  beforeEach(async () => {
    // Remove all DB entities
    await Course.deleteMany()
    await User.deleteMany()

    // Create some test courses
    const course1 = new Course({ name: 'test1' })
    await course1.save()
    const course2 = new Course({ name: 'test2' })
    await course2.save()

    // Generate a token
    const response = await api
      .post(`${apiUrl}/user/generate`)
    token = response.body.token
    await User.updateOne({ _id: response.body.id }, { administrator: true })
  })

  describe(`${apiUrl}/`, () => {
    test('GET', async () => {
      // Check that all courses are returned
      const response = await api
        .get(testUrl)
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(2)
    })

    test('POST', async () => {
      // Check that a new course can be created
      let response = await api
        .post(testUrl)
        .send({ name: 'new' })
        .set('Authorization', `bearer ${token}`)
      expect(response.status).toBe(201)
      expect(response.body.name).toBe('new')
      const foundCourse = await Course.find({ name: 'new' })
      expect(foundCourse).toBeDefined()

      // Check validation
      response = await api
        .post(testUrl)
        .send({})
        .set('Authorization', `bearer ${token}`)
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('course name missing')
    })
  })

  // describe(`${apiUrl}/:name`, async () => {
  //   test('GET', async () => {
  //     // Check that a course can be found by its name
  //     let response = await api
  //       .get(`${testUrl}/test1`)
  //     expect(response.status).toBe(200)
  //     expect(response.body.name).toBe('test1')

  //     // Check that a course which doesn't exist won't be returned
  //     response = await api
  //       .get(`${testUrl}/none`)
  //     expect(response.status).toBe(404)
  //     expect(response.body.error).toBe('course not found')
  //   })
  // })
})

afterAll(() => {
  server.close()
})