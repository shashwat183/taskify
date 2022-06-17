import express, { Express } from 'express'
import { taskRouter } from '../controllers/task-controller'

const app: Express = express()
app.use(express.json())

app.use('/tasks', taskRouter)

export { app }
