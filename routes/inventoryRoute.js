// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/index")
const validate = require('../utilities/management-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:invId", utilities.handleErrors(invController.buildCarDetailsById))

router.get(
   '/',
   utilities.checkAccountType,
   utilities.checkJWTToken,
   utilities.handleErrors(invController.buildManagement)
 )
 

router.get('/add-classification', 
   utilities.checkAccountType,
   utilities.checkJWTToken,
   utilities.handleErrors(invController.buildAddClassification))

router.post(
   '/add-classification',
   validate.classificationRules(),
   validate.checkClassification,
   utilities.checkAccountType,
   utilities.checkJWTToken,
   utilities.handleErrors(invController.addClassification)
)

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.get('/add-inventory', 
   utilities.checkAccountType,
   utilities.checkJWTToken,
   utilities.handleErrors(invController.buildAddInventory))

router.post(
   '/add-inventory',
   validate.inventoryRules(),
   validate.checkInventory,
   utilities.checkAccountType,
   utilities.checkJWTToken,
   utilities.handleErrors(invController.addInventory)
)

// Route to build the edit inventory view
router.get('/edit/:inv_id', 
   utilities.checkAccountType,
   utilities.checkJWTToken,
   utilities.handleErrors(invController.editInventoryView))

router.post(
   "/update/", 
   validate.inventoryRules(),
   validate.checkUpdateData,
   utilities.checkAccountType,
   utilities.checkJWTToken,
   utilities.handleErrors(invController.updateInventory)
)

// Route to delete inventory
router.get("/delete/:inv_id", 
   utilities.checkAccountType,
   utilities.checkJWTToken,
   utilities.handleErrors(invController.buildDeleteConfirmation))

router.post("/delete/", 
   utilities.checkAccountType,
   utilities.checkJWTToken,
   utilities.handleErrors(invController.deleteInventory))

module.exports = router