import express from 'express'

const app = express()

const router = express.Router()

router.get('/health', (req, res) => {
  res.send('OK')
})

app.use(process.env.API_PREFIX ?? '/api/v1', router)

const PORT = process.env.PORT ?? 80

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})
