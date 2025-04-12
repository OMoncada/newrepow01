const utilities = require("../utilities")
const reviewModel = require("../models/review-model")

/* Mostrar el formulario para agregar una reseña */
async function buildAddReview(req, res) {
  const nav = await utilities.getNav()
  const inv_id = req.params.inv_id
  const account_id = res.locals.accountData.account_id
  const screenName = `${res.locals.accountData.account_firstname.charAt(0)}${res.locals.accountData.account_lastname}`

  res.render("review/add-review", {
    title: "Review the Vehicle",
    nav,
    inv_id,
    account_id,
    screenName,
    errors: null
  })
}

/* Procesar la reseña enviada */
async function submitReview(req, res) {
  const { review_text, inv_id, account_id } = req.body
  const result = await reviewModel.addReview(review_text, inv_id, account_id)

  if (result) {
    req.flash("notice", "Thanks for the review, it is displayed below")
    res.redirect(`/inv/detail/${inv_id}`)
  } else {
    req.flash("notice", "Failed to add review.")
    res.redirect(`/review/add/${inv_id}`)
  }
}

// Mostrar reseñas en el panel de cuenta
async function manageReviews(req, res) {
  const account_id = res.locals.accountData.account_id
  const reviews = await reviewModel.getReviewsByAccountId(account_id)
  const nav = await utilities.getNav()

  res.render("review/manage-reviews", {
    title: "Manage Reviews",
    nav,
    reviews,
    errors: null,
    successMessage: req.flash("success")
  })
}

// Vista para editar reseña
async function editReviewView(req, res) {
  const review_id = req.params.review_id
  const review = await reviewModel.getReviewById(review_id)
  const nav = await utilities.getNav()

  const review_date = new Date(review.review_date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  })

  res.render("review/edit-review", {
    title: `${review.inv_make} ${review.inv_model} Review`,
    nav,
    review_text: review.review_text,
    review_date,
    review_id: review.review_id,
    inv_id: review.inv_id,
    account_id: review.account_id,
    inv_make: review.inv_make,
    inv_model: review.inv_model,
    errors: null
  })
}

// Procesar edición
async function updateReview(req, res) {
  const { review_id, review_text } = req.body
  const success = await reviewModel.updateReview(review_id, review_text)

  if (success) {
    req.flash("notice", "✔️ The review has been successfully updated")
  } else {
    req.flash("notice", "❌ The review update failed")
  }

  res.redirect("/account")
}

// Vista para confirmar eliminación
async function confirmDeleteView(req, res) {
  const review_id = req.params.review_id
  const review = await reviewModel.getReviewById(review_id)
  const nav = await utilities.getNav()

  const review_date = new Date(review.review_date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  })

  res.render("review/delete-review", {
    title: `${review.inv_make} ${review.inv_model} Review`,
    nav,
    review_text: review.review_text,
    review_date,
    review_id: review.review_id,
    inv_id: review.inv_id,
    account_id: review.account_id,
    inv_make: review.inv_make,
    inv_model: review.inv_model,
    errors: null
  })
}


// Procesar eliminación
async function deleteReview(req, res) {
  const { review_id } = req.body
  const success = await reviewModel.deleteReview(review_id)
  if (success) {
    req.flash("notice", "✔️ The review has been successfully deleted")
    res.redirect("/account") 
  } else {
    req.flash("notice", "❌ Review deletion failed")
    res.redirect("/review/account")
  }
}


module.exports = {
  buildAddReview,
  submitReview,
  manageReviews,
  editReviewView,
  updateReview,
  confirmDeleteView,
  deleteReview
}
