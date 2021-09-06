import Joi from 'joi';

export interface LoginDto {
  username: string;
  password: string;
}

export const LoginSchema = Joi.object<LoginDto>({
  username: Joi.string().required().messages({
    'any.required': 'Username is required',
    'string.base': 'Username must be a string',
    'string.empty': 'Username cannot be empty',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.base': 'Password must be a string',
    'string.empty': 'Password cannot be empty',
  }),
});
