const supertest = require('supertest')
var mongoose = require('mongoose')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const Course = require('../../src/models/course')
const User = require('../../src/models/user')
const testUrl = `${apiUrl}/courses`

describe('course controller', () => {
  let token
  let adminToken

  beforeEach(async () => {
    // Remove all DB entities
    await Course.deleteMany()
    await User.deleteMany()

    // Create some test courses and an admin and a non-admin
    const course1 = new Course({ name: 'test1' })
    await course1.save()

    let response = await api
      .post(`${apiUrl}/user/generate`)
    token = response.body.token

    const course2 = new Course({ name: 'test2', user: response.body.id })
    await course2.save()

    response = await api
      .post(`${apiUrl}/user/generate`)
    adminToken = response.body.token
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

  describe(`${apiUrl}/:id`, async () => {
    test('GET', async () => {
      // Check that a course can be found by its id
      const course = await Course.findOne({ name: 'test1' })
      const id = course._id
      let response = await api
        .get(`${testUrl}/${id}`)
      expect(response.status).toBe(200)
      expect(response.body.name).toBe('test1')

      // Check that a course which doesn't exist won't be returned
      const fakeId = mongoose.Types.ObjectId()
      response = await api
        .get(`${testUrl}/${fakeId}`)
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('course not found')
    })

    test('PATCH', async () => {
      const course1 = await Course.findOne({ name: 'test1' })
      const id = course1._id

      // A user that didn't create the course cannot edit it
      let response = await api
        .patch(`${testUrl}/${id}`)
        .send({ name: 'changed' })
        .set('Authorization', `bearer ${token}`)
      expect(response.status).toBe(403)
      expect(response.body.error).toBe('Unauthorized')

      // An admin can edit a course created by someone else
      response = await api
        .patch(`${testUrl}/${id}`)
        .send({ name: 'changed' })
        .set('Authorization', `bearer ${adminToken}`)
      expect(response.status).toBe(200)
      expect(response.body.name).toBe('changed')

      const course2 = await Course.findOne({ name: 'test2' })
      const id2 = course2._id

      // A user can edit a course they created
      response = await api
        .patch(`${testUrl}/${id2}`)
        .send({ name: 'changed' })
        .set('Authorization', `bearer ${token}`)
      expect(response.status).toBe(200)
      expect(response.body.name).toBe('changed')

    })
  })

})

afterAll(() => {
  server.close()
})