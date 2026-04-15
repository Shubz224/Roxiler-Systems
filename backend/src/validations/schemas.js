const Joi = require('joi');

// pwd constraints
const passwordSchema = Joi.string()
  .min(8)
  .max(16)
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[!@#$%^&*]/, 'special character')
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must be at most 16 characters',
    'string.pattern.name': 'Password must include at least one {#name}',
  });

// auth schemas

const signupSchema = Joi.object({
  name: Joi.string().min(20).max(60).required().messages({
    'string.min': 'Name must be at least 20 characters',
    'string.max': 'Name must be at most 60 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
  }),
  address: Joi.string().max(400).required().messages({
    'string.max': 'Address must be at most 400 characters',
  }),
  password: passwordSchema,
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema,
});

// admin schemas

const createUserSchema = Joi.object({
  name: Joi.string().min(20).max(60).required(),
  email: Joi.string().email().required(),
  address: Joi.string().max(400).required(),
  password: passwordSchema,
  role: Joi.string().valid('ADMIN', 'USER', 'STORE_OWNER').required(),
});

const createStoreSchema = Joi.object({
  name: Joi.string().min(1).max(60).required(),
  email: Joi.string().email().required(),
  address: Joi.string().max(400).required(),
  ownerId: Joi.number().integer().required(),
});

// rating schemas

const ratingSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be between 1 and 5',
    'number.max': 'Rating must be between 1 and 5',
  }),
});

// validation middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: messages });
  }
  next();
};

module.exports = {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  createStoreSchema,
  ratingSchema,
  validate,
};
