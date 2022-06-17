import { MongoMemoryServer } from 'mongodb-memory-server'
import { app } from '../../src/app/app'
import { v4 as uuidv4 } from 'uuid'
import { Task, ITask, TaskRequest, TaskStatus } from '../../src/models/task'
import { expect } from 'chai'
import mongoose, { HydratedDocument } from 'mongoose'
import { testData } from './test.spec'
import request from 'supertest'

describe('task controller integration tests', function () {
  let mongoServer: MongoMemoryServer
  let loadedData: ITask[]

  before('run mock db', async () => {
    mongoServer = await MongoMemoryServer.create()
    process.env.DB_URL = mongoServer.getUri()
  })

  after('close mock db', async () => {
    delete process.env.DB_URL
    await mongoServer.stop()
  })

  beforeEach('load test data', async function () {
    // Ideally the lean option should be used in insertMany.
    // This would make this operation more efficient.
    // This option does not seem to work for this query though.
    await mongoose.connect(mongoServer.getUri())
    const hydratedData: HydratedDocument<ITask>[] = await Task.insertMany(testData)
    loadedData = hydratedData.map((doc) => {
      return doc.toObject()
    })
    await mongoose.disconnect()
  })

  afterEach('delete loaded data', async () => {
    await mongoose.connect(mongoServer.getUri())
    await Task.deleteMany({})
    await mongoose.disconnect()
  })

  describe('GET /tasks', function () {
    it('should return task', async () => {
      const response = await request(app).get('/tasks')
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.have.deep.members(loadedData)
    })

    it('should return empty array when no tasks in db', async () => {
      await mongoose.connect(mongoServer.getUri())
      await Task.deleteMany({})
      await mongoose.disconnect()
      const response = await request(app).get('/tasks')
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.have.deep.members([])
    })
  })

  describe('GET /tasks/:taskId', function () {
    it('should return task identified by id', async () => {
      const testTask = loadedData[1]
      const response = await request(app).get(`/tasks/${testTask._id}`)
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.be.deep.equal(testTask)
    })

    it('should return HTTP 404 not found if task is not in db', async () => {
      const testUUID: string = uuidv4()
      const response = await request(app).get(`/tasks/${testUUID}`)
      expect(response.statusCode).to.equal(404)
      expect(response.body).to.be.deep.equal({ message: `Task with id - ${testUUID} not found` })
    })
  })

  describe('POST /tasks', function () {
    it('should create task in db', async () => {
      const task: TaskRequest = { task: 'test task', description: 'test description', status: TaskStatus.ToDo }
      const response = await request(app).post('/tasks').send(task)
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.have.property('task', task.task)
      expect(response.body).to.have.property('description', task.description)
      expect(response.body).to.have.property('status', task.status)
      await mongoose.connect(mongoServer.getUri())
      const taskInDb = await Task.findById(response.body._id, {}, { lean: true })
      await mongoose.disconnect()
      expect(taskInDb).to.be.deep.equal(response.body)
    })
  })

  describe('PATCH /tasks/:taskId', function () {
    it('should update task', async () => {
      const taskToUpdateId = loadedData[0]._id
      await mongoose.connect(mongoServer.getUri())
      const taskToUpdate = await Task.findById(taskToUpdateId, {}, { lean: true })
      await mongoose.disconnect()
      expect(taskToUpdate).to.be.deep.equal(loadedData[0])
      const taskUpdate: Partial<TaskRequest> = { task: 'updated task', status: TaskStatus.Done }
      const response = await request(app).patch(`/tasks/${taskToUpdateId}`).send(taskUpdate)
      expect(response.statusCode).to.equal(200)
      await mongoose.connect(mongoServer.getUri())
      const updatedTask = await Task.findById(taskToUpdateId, {}, { lean: true })
      await mongoose.disconnect()
      expect(updatedTask.task).to.be.equal(taskUpdate.task)
      expect(updatedTask.status).to.be.equal(taskUpdate.status)
    })

    it('should return HTTP 404 not found if task is not in db', async () => {
      const testUUID = uuidv4()
      const taskUpdate: Partial<TaskRequest> = { task: 'updated task', status: TaskStatus.Done }
      const response = await request(app).patch(`/tasks/${testUUID}`).send(taskUpdate)
      expect(response.statusCode).to.equal(404)
      expect(response.body).to.be.deep.equal({ message: `Task with id - ${testUUID} not found` })
    })
  })

  describe('DELETE /task/:taskId', function () {
    it('should delete task', async () => {
      const taskToDeleteId = loadedData[0]._id
      const response = await request(app).delete(`/tasks/${taskToDeleteId}`)
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.deep.equal({ message: `Task ${taskToDeleteId} deleted succesfully` })
      await mongoose.connect(mongoServer.getUri())
      const deletedTask = await Task.findById(taskToDeleteId, {}, { lean: true })
      /* eslint-disable-next-line no-unused-expressions */
      expect(deletedTask).to.be.null
      await mongoose.disconnect()
    })

    it('should return HTTP 404 not found if task is not in db', async () => {
      const testUUID = uuidv4()
      const response = await request(app).delete(`/tasks/${testUUID}`)
      expect(response.statusCode).to.equal(404)
      expect(response.body).to.be.deep.equal({ message: `Task with id - ${testUUID} not found` })
    })
  })
})
