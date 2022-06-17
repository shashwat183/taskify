import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

enum TaskStatus {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Done = 'Done'
}

interface ITask {
  _id: string
  task: string
  description: string
  status: TaskStatus
}

type TaskRequest = Pick<ITask, 'task' | 'description' | 'status'>

const taskSchema = new Schema<ITask>({
  _id: { type: String, default: uuidv4 },
  task: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: TaskStatus.ToDo, enum: Object.values(TaskStatus) }
})

const Task = model<ITask>('Task', taskSchema)

export {
  ITask,
  taskSchema,
  Task,
  TaskRequest,
  TaskStatus
}
