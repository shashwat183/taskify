import { TaskService } from '../../src/services/task-service'
import { Task, TaskStatus, TaskRequest, ITask } from '../../src/models/task'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { testData } from './test.spec'
import mongoose, { HydratedDocument } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { expect } from 'chai'

describe('test db service functions', function () {
  let mongoServer: MongoMemoryServer
  let loadedData: ITask[]

  before('run mock db', async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  after('close mock db', async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  beforeEach('load test data', async () => {
    // Ideally the lean option should be used in insertMany.
    // This would make this operation more efficient.
    // This option does not seem to work for this query though.
    const hydratedData: HydratedDocument<ITask>[] = await Task.insertMany(testData)
    loadedData = hydratedData.map((doc) => {
      return doc.toObject()
    })
  })

  afterEach('delete loaded data', async () => {
    await Task.deleteMany({})
  })

  it('should add a task', async function () {
    const taskRequest: TaskRequest = {
      task: 'test task',
      description: 'test description',
      status: TaskStatus.ToDo
    }
    const dummyTask = <ITask>taskRequest
    dummyTask._id = uuidv4()
    const taskService: TaskService = new TaskService(Task)
    const response: ITask | null = await taskService.addTask(taskRequest)
    /* eslint-disable-next-line no-unused-expressions */
    expect(response).is.not.null
    expect(response.task).is.equal(dummyTask.task)
    expect(response.description).is.equal(dummyTask.description)
    expect(response.status).is.equal(dummyTask.status)
  })

  it('should return task', async function () {
    const taskService: TaskService = new TaskService(Task)
    const loadedTask: ITask = loadedData[0]
    const response: ITask | null = await taskService.getTaskById(loadedTask._id)
    /* eslint-disable-next-line no-unused-expressions */
    expect(response).is.not.null
    if (response) {
      expect(response._id).is.equal(loadedTask._id)
      expect(response.task).is.equal(loadedTask.task)
      expect(response.description).is.equal(loadedTask.description)
      expect(response.status).is.equal(loadedTask.status)
    }
  })

  it('should return null when task with id not in db', async function () {
    const taskService: TaskService = new TaskService(Task)
    const response: ITask | null = await taskService.getTaskById(uuidv4())
    /* eslint-disable-next-line no-unused-expressions */
    expect(response).is.null
  })

  it('should return all tasks in db', async function () {
    const taskService: TaskService = new TaskService(Task)
    const response: ITask[] = await taskService.getAllTasks()
    expect(response).to.have.deep.members(loadedData)
  })

  it('should update task', async function () {
    const taskService: TaskService = new TaskService(Task)
    const taskToUpdate = loadedData[0]
    const update: Partial<TaskRequest> = {
      task: 'updated test task',
      status: TaskStatus.ToDo
    }
    const response: ITask | null = await taskService.updateTask(taskToUpdate._id, update)
    /* eslint-disable-next-line no-unused-expressions */
    expect(response).is.not.null
    if (response) {
      expect(response._id).is.equal(taskToUpdate._id)
      expect(response.task).is.equal(update.task)
      expect(response.description).is.equal(taskToUpdate.description)
      expect(response.status).is.equal(update.status)
    }
  })

  it('should delete task', async function () {
    const taskService: TaskService = new TaskService(Task)
    const taskToDelete = loadedData[1]
    const response: void | ITask | null = await taskService.deleteTask(taskToDelete._id)
    /* eslint-disable-next-line no-unused-expressions */
    expect(response).is.not.null
    if (response) {
      expect(response._id).is.equal(taskToDelete._id)
      expect(response.task).is.equal(taskToDelete.task)
      expect(response.description).is.equal(taskToDelete.description)
      expect(response.status).is.equal(taskToDelete.status)
    }
  })
})
