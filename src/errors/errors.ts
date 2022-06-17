class TaskNotFoundError extends Error {
  constructor (msg: string) {
    super(msg)
    Object.setPrototypeOf(this, TaskNotFoundError.prototype)
  }
}

export {
  TaskNotFoundError
}
