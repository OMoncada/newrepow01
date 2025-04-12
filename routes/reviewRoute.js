const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities")

router.get("/add/:inv_id", utilities.checkLogin, reviewController.buildAddReview)
router.post("/add", utilities.checkLogin, reviewController.submitReview)

// NUEVAS RUTAS
router.get("/account", utilities.checkLogin, reviewController.manageReviews)
router.get("/edit/:review_id", utilities.checkLogin, reviewController.editReviewView)
router.post("/update", utilities.checkLogin, reviewController.updateReview)
router.get("/delete/:review_id", utilities.checkLogin, reviewController.confirmDeleteView)
router.post("/delete", utilities.checkLogin, reviewController.deleteReview)

module.exports = router
