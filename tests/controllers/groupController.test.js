const supertest = require('supertest')
const { app, server, apiUrl } = require('../../src/server')
const api = supertest(app)
const Course = require('../../src/models/course')
const Group = require('../../src/models/group')
const User = require('../../src/models/user')
const testUrl = `${apiUrl}/groups`

describe('group controller', () => {
  let course
  let course2
  let token
  let adminToken

  beforeEach(async () => {
    // Remove all DB entities
    await Course.deleteMany()
    await Group.deleteMany()
    await User.deleteMany()

    // Generate an admin token and a regular user token and some courses
    let response = await api
      .post(`${apiUrl}/user/generate`)
    token = response.body.token

    course = new Course({ name: 'test', user: response.body.id })
    await course.save()

    response = await api
      .post(`${apiUrl}/user/generate`)
    adminToken = response.body.token
    await User.updateOne({ _id: response.body.id }, { administrator: true })

    course2 = new Course({ name: 'test2', user: response.body.id })
    await course2.save()

    // Create some test groups
    const group1 = new Group({ name: 'group1', courseId: course._id })
    const group2 = new Group({ name: 'group2', courseId: course._id })
    await group1.save()
    await group2.save()
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
      // Check validation
      let response = await api
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

      // Admin can always add groups to courses
      response = await api
        .post(testUrl)
        .send({ name: 'test', courseId: course._id })
        .set('Authorization', `bearer ${ adminToken }`)
      expect(response.status).toBe(201)
      expect(response.body.name).toBe('test')
      const foundGroup = await Group.findOne({ name: 'test' })
      expect(foundGroup).toBeDefined()
      const updatedCourse = await Course.findById(course._id)
      expect(updatedCourse.groups.length).toBe(1)

      // A User can add groups to a course created by them
      response = await api
        .post(testUrl)
        .send({ name: 'newGroup', courseId: course._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(201)
      expect(response.body.name).toBe('newGroup')
      const foundGroup2 = await Group.findOne({ name: 'newGroup' })
      expect(foundGroup2).toBeDefined()
      const updatedCourse2 = await Course.findById(course._id)
      expect(updatedCourse2.groups.length).toBe(2)

      // A user cannot add groups to a course created by someone else
      response = await api
        .post(testUrl)
        .send({ name: 'newGroup', courseId: course2._id })
        .set('Authorization', `bearer ${ token }`)
      expect(response.status).toBe(403)
      expect(response.body.error).toBe('Unauthorized')

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