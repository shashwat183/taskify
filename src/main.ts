import { app } from './app/app'
import dotenv from 'dotenv'

dotenv.config()

const port = process.env.PORT || '8000'

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
