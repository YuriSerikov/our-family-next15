import express from 'express'
import fileUpload from 'express-fileupload'
import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import config from 'config'
import path from 'path'
import authRouter from './routes/auth.routes.js'
import photoRouter from './routes/photo.routes.js'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  }),
)

//add other middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(express.static('photos'))
app.use('/api/auth', authRouter)
app.use('/api/photo', photoRouter)
app.use(express.json())

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, '/../client/dist')))
  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '/../client/dist/index.html'), function (err) {
      if (err) {
        res.status(500).send(err)
      }
    })
  })
}

const PORT: number = config.get('port') || 5501

//const message = 'Backend started ...'
console.log('Backend started ...')

async function start() {
  const mongoDB_URL: string = config.get('mongoDB_URL')
  try {
    mongoose.set('strictQuery', false)
    await mongoose.connect(mongoDB_URL)
  } catch (error) {
    console.log(error)
  }
  // запуск приложения
  app.listen(PORT, () => console.log(`Приложение работает через порт ${PORT}`))
}

start()
