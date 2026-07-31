// Must run AFTER verifyToken, since it relies on req.user being set.
// Usage: router.post('/route', verifyToken, isAdmin, controllerFn)
module.exports = function isAdmin(req, res, next) {

  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};