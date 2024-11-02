import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello world!')
})

const PORT = process.env.PORT ?? 80

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})
