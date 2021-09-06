import Joi from 'joi';

export interface ConfirmEmailDto {
  token: string;
}

export const ConfirmEmailSchema = Joi.object<ConfirmEmailDto>({
  token: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'any.required': 'Token is required',
    'string.base': 'Token must be a string',
    'string.empty': 'Token cannot be empty',
    'string.uuid': 'Token must be a valid UUID',
  }),
});
