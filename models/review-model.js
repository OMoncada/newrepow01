const pool = require("../database")

/**
 * Agrega una reseña a la base de datos
 */
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = `
      INSERT INTO review (review_text, inv_id, account_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `
    const result = await pool.query(sql, [review_text, inv_id, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("addReview error:", error)
    return null
  }
}

/**
 * Obtiene todas las reseñas de un vehículo específico por ID
 */
async function getReviewsByVehicleId(inv_id) {
  try {
    const sql = `
      SELECT r.review_text, r.review_date, a.account_firstname, a.account_lastname
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC;
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByVehicleId error:", error)
    return []
  }
}

/**
 * Obtiene las reseñas hechas por un usuario específico
 */
async function getReviewsByAccountId(account_id) {
  try {
    const data = await pool.query(
      `SELECT r.review_id, r.review_text, r.review_date, i.inv_make, i.inv_model
       FROM review r
       JOIN inventory i ON r.inv_id = i.inv_id
       WHERE r.account_id = $1
       ORDER BY r.review_date DESC;`,
      [account_id]
    )
    return data.rows
  } catch (error) {
    console.error("getReviewsByAccountId error", error)
    throw error
  }
}

/**
 * Obtiene una reseña específica por ID
 */
async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT r.*, i.inv_make, i.inv_model
      FROM review r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE review_id = $1;
    `
    const result = await pool.query(sql, [review_id])
    return result.rows[0]
  } catch (error) {
    console.error("getReviewById error:", error)
    return null
  }
}

/**
 * Actualiza una reseña existente
 */
async function updateReview(review_id, review_text) {
  try {
    const sql = `
      UPDATE review
      SET review_text = $1, review_date = CURRENT_TIMESTAMP
      WHERE review_id = $2
      RETURNING *;
    `
    const result = await pool.query(sql, [review_text, review_id])
    return result.rows[0]
  } catch (error) {
    console.error("updateReview error:", error)
    return null
  }
}

/**
 * Elimina una reseña específica
 */
async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM review WHERE review_id = $1;`
    await pool.query(sql, [review_id])
    return true
  } catch (error) {
    console.error("deleteReview error:", error)
    return false
  }
}

module.exports = {
  getReviewsByAccountId,
  addReview,
  getReviewsByVehicleId,
  getReviewById,
  updateReview,
  deleteReview
}
