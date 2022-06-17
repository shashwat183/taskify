import { Model } from 'mongoose'
import { ITask, TaskRequest } from '../models/task'

class TaskService {
  TaskModel: Model<ITask>

  constructor (TaskModel: Model<ITask>) {
    this.TaskModel = TaskModel
  }

  public async addTask (task: TaskRequest) {
    const saveTask = new this.TaskModel(task)
    const newTask: ITask = await saveTask.save()

    return newTask
  }

  public async getTaskById (taskId: string) {
    const task: ITask | null = await this.TaskModel.findById(taskId)
    return task
  }

  public async getAllTasks () {
    const tasks: ITask[] = await this.TaskModel.find({}, null, { lean: true })
    return tasks
  }

  public async updateTask (taskId: string, updates: Partial<TaskRequest>) {
    const updatedTask: ITask | null = await this.TaskModel.findByIdAndUpdate(taskId, updates, { new: true, runValidators: true })
    return updatedTask
  }

  public async deleteTask (taskId: string) {
    const task: void | ITask | null = await this.TaskModel.findByIdAndDelete(taskId)
    return task
  }
}

export {
  TaskService
}
