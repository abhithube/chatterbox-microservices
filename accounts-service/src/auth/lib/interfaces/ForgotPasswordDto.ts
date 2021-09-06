import Joi from 'joi';

export interface ForgotPasswordDto {
  email: string;
}

export const ForgotPasswordSchema = Joi.object<ForgotPasswordDto>({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.base': 'Email must be a string',
    'string.empty': 'Email cannot be empty',
    'string.email': 'Email must be a valid email address',
  }),
});
