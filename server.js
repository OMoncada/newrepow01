/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/index")
const inventoryRoute = require("./routes/inventoryRoute");
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const session = require("express-session")
const flash = require("connect-flash")

/* ***********************
 * Middleware
 *************************/
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true
}))

// Express Messages Middleware
app.use(flash())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// Archivos estáticos
app.use(express.static("public"))

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root
app.use(static)

/* ***********************
 * Routes
 *************************/

//Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

app.get("/", function(req, res){ 
  res.render("index", {title: "Home"})
})

// Inventory routes
app.use("/inv", inventoryRoute);

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
