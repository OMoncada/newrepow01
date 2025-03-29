const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/index")
const validate = require("../utilities/management-validation")

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:invId", utilities.handleErrors(invController.buildCarDetailsById))

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(invController.buildManagementView)
)

router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/add-classification",
  validate.classificationRules(),
  validate.checkClassification,
  utilities.checkLogin,
  utilities.handleErrors(invController.addClassification)
)

router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/add-inventory",
  validate.inventoryRules(),
  validate.checkInventory,
  utilities.checkLogin,
  utilities.handleErrors(invController.addInventory)
)

module.exports = router
