import express, { Request, Response, NextFunction } from 'express'
import { connect, disconnect } from 'mongoose'
import { Task, ITask, TaskRequest } from '../models/task'
import { TaskService } from '../services/task-service'
import { dbConnect, dbDisconnect } from '../services/db'
import { genericHandler, taskNotFoundErrorHandler } from '../error_handlers/task-controller-error-handlers'
import { TaskNotFoundError } from '../errors/errors'

const router = express.Router()

// Get a list of all tasks in the DB.
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await dbConnect(connect)
    const taskService = new TaskService(Task)
    const tasks: ITask[] = await taskService.getAllTasks()
    res.json(tasks)
  } catch (err) {
    next(err)
  } finally {
    await dbDisconnect(disconnect)
  }
})

// Get task by task-id(UUID)
router.get('/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await dbConnect(connect)
    const taskService = new TaskService(Task)
    const task: ITask | null = await taskService.getTaskById(req.params.taskId)
    if (task) res.json(task)
    else next(new TaskNotFoundError(`Task with id - ${req.params.taskId} not found`))
  } catch (err) {
    next(err)
  } finally {
    await dbDisconnect(disconnect)
  }
})

// Add a task to the todo list
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await dbConnect(connect)
    const taskRequest: TaskRequest = req.body
    const taskService = new TaskService(Task)
    const task: ITask = await taskService.addTask(taskRequest)
    res.json(task)
  } catch (err) {
    next(err)
  } finally {
    await dbDisconnect(disconnect)
  }
})

// Edit task identified via task-id(UUID)
router.patch('/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await dbConnect(connect)
    const updates: Partial<TaskRequest> = req.body
    const taskService = new TaskService(Task)
    const updatedTask: ITask | null = await taskService.updateTask(req.params.taskId, updates)
    if (updatedTask) res.json(updatedTask)
    else next(new TaskNotFoundError(`Task with id - ${req.params.taskId} not found`))
  } catch (err) {
    next(err)
  } finally {
    await dbDisconnect(disconnect)
  }
})

// Delete a task identified via task-id(UUID)
router.delete('/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await dbConnect(connect)
    const taskService = new TaskService(Task)
    const task = await taskService.deleteTask(req.params.taskId)
    if (task) res.json({ message: `Task ${req.params.taskId} deleted succesfully` })
    else next(new TaskNotFoundError(`Task with id - ${req.params.taskId} not found`))
  } catch (err) {
    next(err)
  } finally {
    await dbDisconnect(disconnect)
  }
})

router.use(taskNotFoundErrorHandler)
router.use(genericHandler)

export { router as taskRouter }
