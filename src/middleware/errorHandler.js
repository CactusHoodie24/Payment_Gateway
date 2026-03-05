function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }

  // Validation errors
  if (err.type === 'validation') {
    return res.status(422).json({ message: err.message, errors: err.errors });
  }

  const status  = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
}

module.exports = errorHandler;
