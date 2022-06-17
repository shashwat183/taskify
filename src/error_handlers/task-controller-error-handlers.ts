import { Request, Response, NextFunction } from 'express'
import { TaskNotFoundError } from '../errors/errors'

function genericHandler (error: Error, _req: Request, res: Response, next: NextFunction) {
  res.status(500).send({ message: error.message })
  next()
}

function taskNotFoundErrorHandler (error: TaskNotFoundError, _req: Request, res: Response, next: NextFunction) {
  if (error instanceof TaskNotFoundError) {
    res.status(404).send({ message: error.message })
    next()
  } else {
    next(error)
  }
}

export {
  genericHandler,
  taskNotFoundErrorHandler
}
