import { TaskRequest, TaskStatus } from '../../src/models/task'

export const testData: Array<TaskRequest> = [
  { task: 'test task 1', description: 'test description 1', status: TaskStatus.ToDo },
  { task: 'test task 2', description: 'test description 2', status: TaskStatus.InProgress },
  { task: 'test task 3', description: 'test description 3', status: TaskStatus.Done }
]
