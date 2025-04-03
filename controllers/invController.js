const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* Build inventory by classification view */
invCont.buildByClassificationId = async function (req, res, next) {
   const classification_id = req.params.classificationId
   const data = await invModel.getInventoryByClassificationId(classification_id)
   const grid = await utilities.buildClassificationGrid(data)
   let nav = await utilities.getNav()
   const className = data[0].classification_name
   res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      errors: null,
   })
}

/* Build car details view */
invCont.buildCarDetailsById = async function (req, res, next) {
   const inv_id = req.params.invId
   const data = await invModel.getCarDetailsById(inv_id)
   const details = await utilities.buildCarDetails(data)
   let nav = await utilities.getNav()
   const vehicleName = data[0].inv_make + ' ' + data[0].inv_model
   res.render("./inventory/details", {
      title: vehicleName + " Details",
      nav, 
      details,
      errors: null,
   })
}

/* Build management view */
invCont.buildManagement = async function(req, res) {
   let nav = await utilities.getNav()
   let messages = req.flash("notice") // <-- ¡IMPORTANTE!
   const classificationSelect = await utilities.buildClassificationList()
   res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationSelect: classificationSelect,
      messages: messages // <-- pásalo a la vista
   })
}

/* Build add classification view */
invCont.buildAddClassification = async function (req, res, next) {
   let nav = await utilities.getNav()
   res.render("./inventory/add-classification", {
      title: 'Add New Classification',
      nav,
      errors: null,
   })
}

/* Process add classification */
invCont.addClassification = async function(req, res) {
   const classificationName = req.body.classification_name
   const addClassResult = await invModel.insertClassification(classificationName)

   if (addClassResult) {
      req.flash("notice", `The ${classificationName} classification was successfully added.`)
      return res.redirect('/inv')
   } else {
      req.flash("notice", "Provide a correct classification name.")
      res.redirect('/inv/add-classification')
   }
}

/* Build add inventory view */
invCont.buildAddInventory = async function (req, res, next) {
   let nav = await utilities.getNav()
   let classificationList = await utilities.buildClassificationList(req.body.classification_id)
   res.render("./inventory/add-inventory", {
      title: 'Add New Inventory',
      nav,
      errors: null,
      classificationList: classificationList,
   })
}

/* Process add inventory */
invCont.addInventory = async function(req, res) {
   const inventoryData = {
      classification_id: req.body.classification_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color
   }

   const addInvResult = await invModel.insertInventory(inventoryData)

   if (addInvResult) {
      req.flash("notice", `The ${inventoryData.inv_make} ${inventoryData.inv_model} was successfully added.`)
      return res.redirect('/inv')
   } else {
      req.flash("notice", `Failed to add ${inventoryData.inv_make} ${inventoryData.inv_model} to inventory`)
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList(inventoryData.classification_id)
      return res.render("./inventory/add-inventory", {
         title: "Add New Inventory",
         nav, 
         errors: req.validationErrors(),
         classificationList: classificationList, 
         locals: req.body
      })
   }
}

/* Return Inventory by Classification As JSON */
invCont.getInventoryJSON = async (req, res, next) => {
   const classification_id = parseInt(req.params.classification_id)
   const invData = await invModel.getInventoryByClassificationId(classification_id)
   if (invData[0].inv_id) {
      return res.json(invData)
   } else {
      next(new Error("No data returned"))
   }
}

/* Build edit inventory view */
invCont.editInventoryView = async function (req, res, next) {
   const inv_id = parseInt(req.params.inv_id)
   let nav = await utilities.getNav()
   const data = await invModel.getCarDetailsById(inv_id)
   const itemData = data[0]
   const classificationList = await utilities.buildClassificationList(itemData.classification_id)
   const itemName = `${itemData.inv_make} ${itemData.inv_model}`
   res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,
      ...itemData
   })
}

/* Update Inventory Data */
invCont.updateInventory = async function (req, res, next) {
   let nav = await utilities.getNav()
   const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
   } = req.body

   const updateResult = await invModel.updateInventory(
      inv_id,  
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
   )

   if (updateResult) {
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", `The ${itemName} was successfully updated.`)
      res.redirect("/inv/")
   } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).render("inventory/edit-inventory", {
         title: "Edit " + itemName,
         nav,
         classificationSelect,
         errors: null,
         inv_id,
         inv_make,
         inv_model,
         inv_year,
         inv_description,
         inv_image,
         inv_thumbnail,
         inv_price,
         inv_miles,
         inv_color,
         classification_id
      })
   }
}

/* Delete confirmation view */
invCont.buildDeleteConfirmation = async function (req, res, next) {
   const inv_id = parseInt(req.params.inv_id)
   let nav = await utilities.getNav()
   const data = await invModel.getCarDetailsById(inv_id)
   const itemData = data[0]
   const itemName = `${itemData.inv_make} ${itemData.inv_model}`
   res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      ...itemData
   })
}

/* Delete Inventory Data */
invCont.deleteInventory = async function (req, res, next) {
   let nav = await utilities.getNav()
   const inv_id = parseInt(req.body.inv_id)

   const deleteResult = await invModel.deleteInventory(inv_id)

   if (deleteResult) {
      req.flash("notice", `The inventory item was successfully deleted.`)
      res.redirect("/inv/")
   } else {
      req.flash("notice", "Sorry, the deletion failed.")
      res.status(501).render("inventory/delete-confirm", {
         title: "Delete Inventory",
         nav,
         errors: null,
         inv_id,
      })
   }
}

module.exports = invCont
