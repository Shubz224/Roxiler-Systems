// Adds res.success() and res.error() to every response
// This ensures a consistent response shape across all endpoints

const apiResponse = (req, res, next) => {
  res.success = (data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
  };

  res.error = (message = 'Something went wrong', statusCode = 500) => {
    return res.status(statusCode).json({ success: false, message });
  };

  next();
};

module.exports = apiResponse;
