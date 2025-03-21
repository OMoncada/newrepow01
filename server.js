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
const errorRoute = require("./routes/errorRoute")


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

// Error testing route
app.use("/error", errorRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

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

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();  // Obtener la barra de navegación
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);  // Imprimir error en consola
  res.render("errors/error", {  // Renderizar la vista de error
    title: err.status || 'Server Error',
    message: err.message,
    nav
  });
});
