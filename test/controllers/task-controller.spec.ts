import request from 'supertest'
import * as taskService from '../../src/services/task-service'
import { expect } from 'chai'
import { v4 as uuidv4 } from 'uuid'
import * as db from '../../src/services/db'
import { ImportMock, MockManager } from 'ts-mock-imports'
import { app } from '../../src/app/app'
import { ITask, TaskRequest, TaskStatus } from '../../src/models/task'
import { SinonStub } from 'sinon'

describe('task controller tests', function () {
  const dummyTasks: ITask[] = [
    { _id: uuidv4(), task: 'test task 1', description: 'test description 1', status: TaskStatus.ToDo },
    { _id: uuidv4(), task: 'test task 2', description: 'test description 2', status: TaskStatus.ToDo }
  ]
  let connectStub: SinonStub
  let disconnectStub: SinonStub
  let taskServiceStub: MockManager<taskService.TaskService>

  before('create mock imports', () => {
    connectStub = ImportMock.mockFunction(db, 'dbConnect')
    disconnectStub = ImportMock.mockFunction(db, 'dbDisconnect')
    taskServiceStub = ImportMock.mockClass(taskService, 'TaskService')
  })

  after('restore mock imports', () => {
    connectStub.restore()
    disconnectStub.restore()
    taskServiceStub.restore()
  })

  describe('GET /tasks tests', function () {
    it('should return all tasks in db', async () => {
      const getAllTasksStub = taskServiceStub.mock('getAllTasks', dummyTasks)
      const response = await request(app).get('/tasks')
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.have.deep.members(dummyTasks)
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(getAllTasksStub.called).is.true
    })

    it('should respond with 500 when error occurs', async () => {
      const dummyError = new Error('test error')
      const getAllTasksStub = taskServiceStub.mock('getAllTasks').throws(dummyError)
      const response = await request(app).get('/tasks')
      expect(response.statusCode).to.equal(500)
      expect(response.body).to.deep.equal({ message: 'test error' })
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(getAllTasksStub.called).is.true
    })
  })

  describe('GET /tasks/:taskId tests', function () {
    it('should return task identified by id in db', async () => {
      const testTask = dummyTasks[0]
      const getTaskByIdStub = taskServiceStub.mock('getTaskById', testTask)
      const response = await request(app).get(`/tasks/${testTask._id}`)
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.deep.equal(testTask)
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(getTaskByIdStub.calledOnceWith(testTask._id)).is.true
    })

    it('should return task not found error when task doesnt exist', async () => {
      const testTask = dummyTasks[0]
      const getTaskByIdStub = taskServiceStub.mock('getTaskById', null)
      const response = await request(app).get(`/tasks/${testTask._id}`)
      expect(response.statusCode).to.equal(404)
      expect(response.body).to.deep.equal({ message: `Task with id - ${testTask._id} not found` })
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(getTaskByIdStub.calledOnceWith(testTask._id)).is.true
    })

    it('should respond with 500 when error occurs', async () => {
      const testTask = dummyTasks[0]
      const dummyError = new Error('test error')
      const getTaskByIdStub = taskServiceStub.mock('getTaskById')
      getTaskByIdStub.throws(dummyError)
      const response = await request(app).get(`/tasks/${testTask._id}`)
      expect(response.statusCode).to.equal(500)
      expect(response.body).to.deep.equal({ message: 'test error' })
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(getTaskByIdStub.calledOnceWith(testTask._id)).is.true
    })
  })

  describe('POST /tasks tests', function () {
    it('should add task to db - POST /tasks', async () => {
      const testTask = dummyTasks[1]
      const taskRequest: TaskRequest = <TaskRequest>testTask
      const addTaskStub = taskServiceStub.mock('addTask', testTask)
      const response = await request(app).post('/tasks').send(taskRequest)
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.deep.equal(testTask)
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(addTaskStub.calledOnceWith(taskRequest)).is.true
    })

    it('should respond with 500 when error occurs', async () => {
      const testTask = dummyTasks[1]
      const taskRequest: TaskRequest = <TaskRequest>testTask
      const dummyError = new Error('test error')
      const addTaskStub = taskServiceStub.mock('addTask').throws(dummyError)
      const response = await request(app).post('/tasks').send(taskRequest)
      expect(response.statusCode).to.equal(500)
      expect(response.body).to.deep.equal({ message: 'test error' })
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(addTaskStub.calledOnceWith(taskRequest)).is.true
    })
  })

  describe('PATCH /tasks/:taskId tests', function () {
    it('should update task in db - PATCH /tasks/:taskId', async () => {
      const testTask: ITask = dummyTasks[1]
      const taskRequest: TaskRequest = <TaskRequest>testTask
      const updateTaskStub = taskServiceStub.mock('updateTask', testTask)
      const response = await request(app).patch(`/tasks/${testTask._id}`).send(taskRequest)
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.deep.equal(testTask)
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(updateTaskStub.calledOnceWith(testTask._id, taskRequest)).is.true
    })

    it('should return task not found error when task doesnt exist', async () => {
      const testTask: ITask = dummyTasks[1]
      const taskRequest: TaskRequest = <TaskRequest>testTask
      const updateTaskStub = taskServiceStub.mock('updateTask', null)
      const response = await request(app).patch(`/tasks/${testTask._id}`).send(taskRequest)
      expect(response.statusCode).to.equal(404)
      expect(response.body).to.deep.equal({ message: `Task with id - ${testTask._id} not found` })
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(updateTaskStub.calledOnceWith(testTask._id, taskRequest)).is.true
    })

    it('should respond with 500 when error occurs', async () => {
      const testTask: ITask = dummyTasks[1]
      const taskRequest: TaskRequest = <TaskRequest>testTask
      const dummyError = new Error('test error')
      const updateTaskStub = taskServiceStub.mock('updateTask')
      updateTaskStub.throws(dummyError)
      const response = await request(app).patch(`/tasks/${testTask._id}`).send(taskRequest)
      expect(response.statusCode).to.equal(500)
      expect(response.body).to.deep.equal({ message: 'test error' })
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(updateTaskStub.calledOnceWith(testTask._id, taskRequest)).is.true
    })
  })

  describe('DELETE /tasks/:taskId tests', function () {
    it('should delete task in db - DELETE /tasks/:taskId', async () => {
      const testTask: ITask = dummyTasks[1]
      const deleteTaskStub = taskServiceStub.mock('deleteTask', testTask)
      const response = await request(app).delete(`/tasks/${testTask._id}`)
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.deep.equal({ message: `Task ${testTask._id} deleted succesfully` })
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(deleteTaskStub.calledOnceWith(testTask._id)).is.true
    })

    it('should return task not found error when task doesnt exist', async () => {
      const testTask: ITask = dummyTasks[1]
      const deleteTaskStub = taskServiceStub.mock('deleteTask', null)
      const response = await request(app).delete(`/tasks/${testTask._id}`)
      expect(response.statusCode).to.equal(404)
      expect(response.body).to.deep.equal({ message: `Task with id - ${testTask._id} not found` })
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(deleteTaskStub.calledOnceWith(testTask._id)).is.true
    })

    it('should respond with 500 when error occurs', async () => {
      const testTask: ITask = dummyTasks[1]
      const dummyError = new Error('test error')
      const deleteTaskStub = taskServiceStub.mock('deleteTask')
      deleteTaskStub.throws(dummyError)
      const response = await request(app).delete(`/tasks/${testTask._id}`)
      expect(response.statusCode).to.equal(500)
      expect(response.body).to.deep.equal({ message: 'test error' })
      /* eslint-disable-next-line no-unused-expressions */
      expect(connectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(disconnectStub.called).is.true
      /* eslint-disable-next-line no-unused-expressions */
      expect(deleteTaskStub.calledOnceWith(testTask._id)).is.true
    })
  })
})
