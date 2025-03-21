const errorController = {}

errorController.generateError = (req, res, next) => {
  throw new Error("Simulated server error (500)")
}

module.exports = errorController
