const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pg');
const response = require('../helpers/response');
const COOKIE_NAME = "rt";
const { callFunction } = require('../db/callStoreProc');
const throwError = require('../helpers/throwError');

function generateAccess(user) {
  return jwt.sign(
    { sub: user.username, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
}

function generateRefresh(user) {
  return jwt.sign(
    { sub: user.username },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
}



exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const rows = await callFunction("sp_login_user", [email, password]);
        
        if (rows.length === 0) {
            throw new Error("Email or password is wrong");
        }

        const user = rows[0]

        const accessToken = generateAccess(user);
        const refreshToken = generateRefresh(user);

        await pool.query(
            "INSERT INTO refresh_tokens(user_id, token) VALUES ($1,$2)",
            [user.user_id, refreshToken]
        );

        res.cookie(COOKIE_NAME, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.json({
            accessToken,
            tokenType: "Bearer"
        });
    } catch (err) {
        throw new Error(err);
        // return response.badRequest(res, "Internal server error", [], err.message);
    }
};

/* =========================================
   REFRESH TOKEN
   ========================================= */
exports.refresh = async (req, res) => {
  const token = req.cookies[COOKIE_NAME];

  if (!token)
    return response.unauthorized(res, "No refresh token");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return response.unauthorized(res, "Invalid refresh token");
  }

  try {
    const check = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [token]
    );

    if (check.rowCount === 0)
      return response.unauthorized(res, "Refresh token revoked");

    const userId = payload.sub;

    const accessToken = jwt.sign(
      { sub: userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
    );

    return response.success(res, { accessToken }, "Token refreshed");
  } catch (err) {
    return response.error(res, "Internal server error", 500, err.message);
  }
};

