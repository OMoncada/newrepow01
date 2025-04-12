const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
************************************** */
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + ' details"><img src="' + vehicle.inv_thumbnail
        + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + ' on CSE Motors"></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$'
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the car details view HTML
************************************** */
Util.buildCarDetails = async function (data) {
  let details
  if (data.length > 0) {
    const vehicle = data[0]
    details = '<div id="vehicle-details">'
    details += '<h1>' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h1>'
    details += '<img src="' + vehicle.inv_image + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors">'
    details += '<div class=vehicle-summary>'
    details += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + ' Details</h2>'
    details += '<p><strong>Price: <span>$' + new Intl.NumberFormat("en-US").format(vehicle.inv_price) + '</span></strong></p>'
    details += '<p><strong>Description: </strong>' + vehicle.inv_description + '</p>'
    details += '<p><strong>Color: </strong>' + vehicle.inv_color + '</p>'
    details += '<p><strong>Miles: </strong><span>' + new Intl.NumberFormat("en-US").format(vehicle.inv_miles) + '</span></p>'
    details += '</div></div>'
  } else {
    details += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return details
}

/* **************************************
* Build Classification List for dropdowns
************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * JWT Middleware (Session detection)
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  // Definir variables por defecto
  res.locals.loggedin = false
  res.locals.accountData = null
  res.locals.firstname = null

  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Session expired. Please log in again.")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = true
        res.locals.firstname = accountData.account_firstname
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 * Account Type Middleware
 **************************************** */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin) {
    if (
      res.locals.accountData.account_type === "Employee" ||
      res.locals.accountData.account_type === "Admin"
    ) {
      return next()
    } else {
      req.flash("notice", "Login required. You must be an Employee or Admin to access this page.")
      return res.redirect("/account/login")
    }
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Login check Middleware
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    return next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

Util.buildReviewsList = function (reviews) {
  if (!reviews || reviews.length === 0) {
    return "<p class='no-reviews'>There are no reviews yet.</p>"
  }

  let list = '<ul class="review-list">'
  reviews.forEach(review => {
    list += `<li>
      <strong>${review.account_firstname} ${review.account_lastname}</strong> commented on ${new Date(review.review_date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
      })}:<br>
      <p class="review-text">${review.review_text}</p>
    </li>`
  })
  list += '</ul>'
  return list
}

module.exports = Util
