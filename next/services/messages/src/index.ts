import express from 'express'

const app = express()

app.get('/health', (req, res) => {
  res.send('OK')
})

const PORT = process.env.PORT ?? 80

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`)
})
