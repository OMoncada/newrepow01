const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities/index")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
   let nav = await utilities.getNav()
   res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
   })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
   let nav = await utilities.getNav()
   res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
   })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
   let nav = await utilities.getNav()
   res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
   })
}

 /* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
   let nav = await utilities.getNav()
   const { account_firstname, account_lastname, account_email, account_password } = req.body

   // Hash the password before storing
   let hashedPassword
   try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
   } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/register", {
         title: "Registration",
         nav,
         errors: null,
      })
   }

   const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
   )

   if (regResult) {
      req.flash(
         "success",
         `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
         title: "Login",
         nav,
         errors: null,
      })
   } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
         title: "Registration",
         nav,
         errors: null,
      })
   }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
   let nav = await utilities.getNav()
   const { account_email, account_password } = req.body
   const accountData = await accountModel.getAccountByEmail(account_email)
   if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
         title: "Login",
         nav,
         errors: null,
         account_email,
      })
      return
   }
   try {
      if (await bcrypt.compare(account_password, accountData.account_password)) {
         delete accountData.account_password
         const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
         if(process.env.NODE_ENV === 'development') {
            res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
         res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
      }
      else {
         req.flash("message notice", "Please check your credentials and try again.")
         res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
         })
      }
   } catch (error) {
      throw new Error('Access Forbidden')
   }
}

async function buildAccountUpdate(req, res) {
   const account_id = res.locals.accountData.account_id
   let nav = await utilities.getNav()
   const accountData = await accountModel.getAccountById(account_id)
   res.render("./account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id: account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email
   })
}

async function updateAccount(req, res) {
   let nav = await utilities.getNav()
   const { account_firstname, account_lastname, account_email, account_id } = req.body

   const updateResult = await accountModel.updateAccountData(
      account_firstname,
      account_lastname,
      account_email,
      account_id
   )

   if (updateResult) {
      res.locals.accountData = {
         ...res.locals.accountData,
         account_firstname: updateResult.account_firstname,
         account_lastname: updateResult.account_lastname,
         account_email: updateResult.account_email,
      };
      req.flash(
         "success",
         `Congratulations, your information has been updated.`
      )
      res.status(200).render("account/management", {
         title: "Account Management",
         nav,
         errors: null,
      })
   } else {
      req.flash("notice", "Update failed. Please try again.")
      res.status(500).render("account/update", {
         title: "Edit Account",
         nav,
         errors: null,
         account_firstname: updateResult.account_firstname,
         account_lastname: updateResult.account_lastname,
         account_email: updateResult.account_email,
         account_id: updateResult.account_id,
      })
   }
}

async function changePassword(req, res) {
   let nav = await utilities.getNav()
   const { account_password, account_id } = req.body
   let hashedPassword
   try {
      
      hashedPassword = await bcrypt.hashSync(account_password, 10)
   } catch (error) {
      req.flash("notice", "Password update failed. Please try again.")
      return res.redirect("/account/update")
   }

   const updateResult = await accountModel.updatePassword(
      hashedPassword,
      account_id
   )

   if (updateResult) {
      res.locals.accountData = {
         ...res.locals.accountData,
         account_password: updateResult.account_password,
      }
      req.flash(
         "success",
         `Congratulations, your password has been updated.`
      )
      res.status(200).render("account/management", {
         title: "Account Management",
         nav,
         errors: null,
      })
   } else {
      req.flash("notice", "Password update failed. Please try again.")
      res.status(500).render("account/update", {
         title: "Edit Account",
         nav,
         errors: null,
         account_firstname: res.locals.accountData.account_firstname,
         account_lastname: res.locals.accountData.account_lastname,
         account_email: res.locals.accountData.account_email,
         accountPassword: updateResult.account_password,
         account_id: updateResult.account_id,
      })
   }
}


/**************************************
 * Process logout request
**************************************/
async function logout(req, res, next) {
   res.clearCookie("jwt")
   return res.redirect("/")
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildAccountUpdate, updateAccount, changePassword, logout }