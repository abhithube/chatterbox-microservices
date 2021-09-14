import Joi from 'joi';

export interface JoinPartyDto {
  token: string;
}

export const JoinPartySchema = Joi.object<JoinPartyDto>({
  token: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'any.required': 'Token is required',
    'string.base': 'Token must be a string',
    'string.empty': 'Token cannot be empty',
    'string.uuid': 'Token must be a valid UUID',
  }),
});
