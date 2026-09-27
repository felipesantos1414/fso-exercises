const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

// index.js so inicia o servidor. A aplicacao Express vive em app.js,
// o que permite aos testes importa-la sem subir uma porta de rede.
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
