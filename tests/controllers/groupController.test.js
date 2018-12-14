const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const Course = require('../../src/models/course')
const Group = require('../../src/models/group')
const User = require('../../src/models/user')
const testUrl = `${apiUrl}/groups`

describe('group controller', () => {
  let course
  let token

  beforeEach(async () => {
    // Remove all DB entities
    await Course.deleteMany()
    await Group.deleteMany()
    await User.deleteMany()

    // Create some test courses
    course = new Course({ name: 'test' })
    await course.save()

    // Create some test groups
    const group1 = new Group({ name: 'group1', courseId: course._id })
    const group2 = new Group({ name: 'group2', courseId: course._id })
    await group1.save()
    await group2.save()

    // Generate a token
    const response = await api
      .post(`${apiUrl}/user/generate`)
    token = response.body.token
    await User.updateOne({ _id: response.body.id }, { administrator: true })
  })

  describe('/', () => {
    test('GET', async () => {
      // Check that all groups are returned
      const response = await api
        .get(testUrl)
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(2)
    })

    test('POST', async () => {
      // Check that a new group can be created
      let response = await api
        .post(testUrl)
        .send({ name: 'test', courseId: course._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(201)
      expect(response.body.name).toBe('test')
      const foundGroup = await Group.findOne({ name: 'test' })
      expect(foundGroup).toBeDefined()
      const updatedCourse = await Course.findById(course._id)
      expect(updatedCourse.groups.length).toBe(1)

      // Check validation
      response = await api
        .post(testUrl)
        .send({ name: 'test' })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('some params missing')

      response = await api
        .post(testUrl)
        .send({ courseId: course._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('some params missing')

      response = await api
        .post(testUrl)
        .send({})
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(422)
      expect(response.body.error).toBe('some params missing')

      response = await api
        .post(testUrl)
        .send({ name: 'test', courseId: '123' })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('malformed course id')

      // Check that a group can't be created for an undefined course
      const temporaryCourse = new Course({ name: 'temporary' })
      await temporaryCourse.save()
      await Course.deleteOne({ _id: temporaryCourse._id })
      response = await api
        .post(testUrl)
        .send({ name: 'test', courseId: temporaryCourse._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(404)
      expect(response.body.error).toBe('course not found')
    })
  })
})

afterAll(() => {
  server.close()
})