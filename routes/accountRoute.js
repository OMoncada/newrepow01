const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const regValidate = require('../utilities/account-validation')
const loginValidate = require('../utilities/account-validation')
const accountController = require("../controllers/accountController")

// Mostrar vista de login
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Mostrar vista de registro
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Procesar registro
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Procesar intento de login
router.post(
  "/login",
  loginValidate.loginRules(),
  loginValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router
