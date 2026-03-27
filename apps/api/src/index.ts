import http from 'node:http'

const port = Number(process.env.PORT ?? 3001)

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ status: 'ok', service: '@alea/api' }))
})

if (process.env.NODE_ENV !== 'test') {
  server.listen(port)
}

export { server }
