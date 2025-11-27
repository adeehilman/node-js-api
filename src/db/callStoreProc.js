const pool = require('./pg');

async function callFunction(functionName, params = []) {
  // Contoh: SELECT * FROM my_function($1, $2)
  const placeholders = params.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `SELECT * FROM ${functionName}(${placeholders});`;

  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = {
  callFunction,
};