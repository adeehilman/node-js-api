const { response } = require("express");

module.exports = {
  success(res, message = "SUCCESS", data = []) {
    return res.status(200).json({
      response: 200,
      messageType: "S",
      message: message,
      data: data
    });
  },

  badRequest(res, message = "BAD REQUEST", data = []) {
    return res.status(400).json({
      response: 400,
      messageType: "E",
      message: message,
      data: data
    });
    },
  
    serverError(res, message = "BAD REQUEST", data = []) {
    return res.status(400).json({
        response: 500,
        messageType: "E",
        message: message,
        data: data
        });
    },

  unauthorized(res, message = "UNAUTHORIZED", data = []) {
    return res.status(401).json({
      response: 401,
      messageType: "E",
      message: message,
      data: data
    });
  },

  forbidden(res, message = "FORBIDDEN", data = []) {
    return res.status(403).json({
      response: 403,
      messageTYPE: "E",
      message: message,
      data: data
    });
  }
};
