const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcryptjs")
const utilities = require("../utilities/index")
const accountModel = require("../models/account-model")

/* ****************************************
 *  Deliver login view
 **************************************** */
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
 **************************************** */
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
 **************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Process registration
 **************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash("success", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Register",
        nav,
        errors: null,
      })
    }
  } catch (error) {
    req.flash("notice", "An error occurred during registration.")
    res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login
 **************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    const match = await bcrypt.compare(account_password, accountData.account_password)
    if (match) {
      delete accountData.account_password

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600
      })

      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      return res.redirect("/account")
    } else {
      req.flash("notice", "Invalid password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    req.flash("notice", "Login failed.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Logout (Task 6)
 **************************************** */
function logout(req, res) {
  res.clearCookie("jwt")
  res.redirect("/")
}

/* ****************************************
 *  Show update account form
 **************************************** */
async function buildUpdateView(req, res) {
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  let nav = await utilities.getNav()
  res.render("account/update", {
    title: "Edit Account",
    nav,
    errors: null,
    ...accountData
  })
}

/* ****************************************
 *  Process account update (🟢 actualizado)
 **************************************** */
async function updateAccount(req, res) {
  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email
  } = req.body

  const updateResult = await accountModel.updateAccountData(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  const nav = await utilities.getNav()

  if (updateResult) {
    // 🟢 Obtener info actualizada
    const updatedAccount = await accountModel.getAccountById(account_id)
    delete updatedAccount.account_password

    // 🟢 Crear nuevo token
    const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 3600
    })

    // 🟢 Actualizar cookie
    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    req.flash("notice", "Account information updated successfully.")
    res.redirect("/account")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

/* ****************************************
 *  Process password update
 **************************************** */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)
  const nav = await utilities.getNav()

  if (updateResult) {
    req.flash("notice", "Password updated successfully.")
    res.redirect("/account")
  } else {
    req.flash("notice", "Password update failed.")
    res.status(501).render("account/update", {
      title: "Edit Account",
      nav,
      errors: null
    })
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  buildAccountManagement,
  registerAccount,
  accountLogin,
  logout,
  buildUpdateView,
  updateAccount,
  updatePassword
}
