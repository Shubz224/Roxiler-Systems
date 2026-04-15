const authService = require('../services/auth.service');

// Cookie options for the refresh token — httpOnly prevents JS access
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// POST /auth/signup
const signup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    return res.success(user, 'Account created successfully', 201);
  } catch (err) {
    return res.error(err.message, 400);
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);

    // Refresh token goes in httpOnly cookie — frontend never touches it
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    return res.success({ accessToken, user }, 'Login successful');
  } catch (err) {
    return res.error(err.message, 401);
  }
};

// POST /auth/refresh
const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    const { accessToken, refreshToken } = await authService.refresh(token);

    // Rotate: set new refresh token in cookie
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    return res.success({ accessToken }, 'Token refreshed');
  } catch (err) {
    return res.error(err.message, 401);
  }
};

// POST /auth/logout
const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  return res.success(null, 'Logged out successfully');
};

// PATCH /auth/change-password
const changePassword = async (req, res) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    return res.success(null, 'Password updated successfully');
  } catch (err) {
    return res.error(err.message, 400);
  }
};

module.exports = { signup, login, refresh, logout, changePassword };
