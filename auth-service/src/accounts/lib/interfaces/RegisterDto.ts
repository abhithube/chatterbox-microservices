import Joi from 'joi';

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export const RegisterSchema = Joi.object<RegisterDto>({
  username: Joi.string().required().messages({
    'any.required': 'Username is required',
    'string.base': 'Username must be a string',
    'string.empty': 'Username cannot be empty',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.base': 'Email must be a string',
    'string.empty': 'Email cannot be empty',
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.base': 'Password must be a string',
    'string.empty': 'Password cannot be empty',
  }),
});
