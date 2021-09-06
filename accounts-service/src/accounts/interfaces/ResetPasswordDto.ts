import Joi from 'joi';

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export const ResetPasswordSchema = Joi.object<ResetPasswordDto>({
  token: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'any.required': 'Token is required',
    'string.base': 'Token must be a string',
    'string.empty': 'Token cannot be empty',
    'string.uuid': 'Token must be a valid UUID',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.base': 'Password must be a string',
    'string.empty': 'Password cannot be empty',
  }),
});
