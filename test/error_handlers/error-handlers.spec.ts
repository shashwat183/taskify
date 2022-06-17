import { Request, Response, NextFunction } from 'express'
import { Substitute } from '@fluffy-spoon/substitute'
import { TaskNotFoundError } from '../../src/errors/errors'
import { genericHandler, taskNotFoundErrorHandler } from '../../src/error_handlers/task-controller-error-handlers'

describe('test error handlers', function () {
  it('test generic handler', () => {
    const error = Substitute.for<Error>()
    const req = Substitute.for<Request>()
    const res = Substitute.for<Response>()
    const next = Substitute.for<NextFunction>()
    res.status(500).returns(res)
    error.message.returns('test message')
    genericHandler(error, req, res, next)
    res.received().status(500)
    res.received().send({ message: 'test message' })
  })

  it('test task not found error handler', () => {
    const error = new TaskNotFoundError('test message')
    const req = Substitute.for<Request>()
    const res = Substitute.for<Response>()
    const next = Substitute.for<NextFunction>()
    res.status(404).returns(res)
    taskNotFoundErrorHandler(error, req, res, next)
    res.received().status(404)
    res.received().send({ message: error.message })
    next.received()
  })
})
