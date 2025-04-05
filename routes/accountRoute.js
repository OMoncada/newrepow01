const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accountValidate = require('../utilities/account-validation')
const accountController = require("../controllers/accountController")

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.post(
  "/register",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

// Mostrar formulario para actualizar datos
router.get("/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateView)
)

// Procesar actualización de datos
router.post("/update-account",
  accountValidate.updateRules(),
  accountValidate.checkUpdateData,
  utilities.checkLogin,
  utilities.handleErrors(accountController.updateAccount)
)

// Procesar cambio de contraseña
router.post("/update-password",
  accountValidate.updatePasswordRules(),
  accountValidate.checkPasswordUpdate,
  utilities.checkLogin,
  utilities.handleErrors(accountController.updatePassword)
)

// Logout
router.get(
  "/logout",
  utilities.checkLogin,
  accountController.logout
)

module.exports = router
