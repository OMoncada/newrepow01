const accountModel = require("../models/inventory-model")
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.classificationRules = () => {
   return [
      body("classification_name")
         .trim()
         .escape()
         .notEmpty()
         .isLength({ min: 2 })
         .isAlphanumeric()
         .withMessage("Provide a correct classification name.")
   ]
}

validate.checkClassification = async (req, res, next) => {
   const { classification_name } = req.body
   let errors = []
   errors = validationResult(req)
   if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      console.log("Errors occurred.")
      return res.render("./inventory/add-classification", {
         title: "Add New Classification",
         nav,
         errors,
         classification_name,
      })
   }
   next()
}

validate.inventoryRules = () => {
   return [
      body("classification_id")
         .trim()
         .escape()
         .notEmpty()
         .isInt()
         .withMessage("Please provide a valid classification."),

      body("inv_make")
         .trim()
         .escape()
         .notEmpty()
         .isLength({ min: 3})
         .withMessage("Please provide a valid make."),

      body("inv_model")
         .trim()
         .escape()
         .notEmpty()
         .isLength({ min: 3})
         .withMessage("Please provide a valid model."),

      body("inv_year")
         .trim()
         .escape()
         .notEmpty()
         .isLength({ min: 4, max: 4})
         .isNumeric()
         .withMessage("Please provide a valid year."),

      body("inv_description")
         .trim()
         .escape()
         .notEmpty()
         .withMessage("Please provide a valid description."),

      body("inv_image")
         .trim()
         .escape()
         .notEmpty()
         .withMessage("Please provide a valid image path."),

      body("inv_thumbnail")
         .trim()
         .escape()
         .notEmpty()
         .withMessage("Please provide a valid thumbnail path."),

      body("inv_price")
         .trim()
         .escape()
         .notEmpty()
         .matches(/^\d+(\.\d{1,2})?$/)
         .withMessage("Please provide a valid price."),

      body("inv_miles")
         .trim()
         .escape()
         .notEmpty()
         .isInt({ min: 0 })
         .withMessage("Please provide a valid mileage."),

      body("inv_color")
         .trim()
         .escape()
         .notEmpty()
         .isString()
         .withMessage("Please provide a valid color."),
   ]
}

validate.checkInventory = async (req, res, next) => {

   let errors = []
   errors = validationResult(req)
   if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList(req.body.classification_id);
      console.log("Errors occurred.")
      return res.render("./inventory/add-inventory", {
         title: "Add New Inventory",
         nav,
         errors,
         classificationList,
         locals: req.body
      })
   }
   next()
}

/****************************
 * Errors will be directed back to the edit view.
****************************/
validate.checkUpdateData = async (req, res, next) => {
   let inv_id = req.body.inv_id
   let errors = []
   errors = validationResult(req)
   if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList(req.body.classification_id);
      console.log("Errors occurred.")
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`
      return res.render("./inventory/edit-inventory", {
         title: "Edit " + itemName,
         nav,
         errors,
         classificationList,
         locals: req.body,
         inv_id: inv_id
      })
   }
   next()
}

module.exports = validate