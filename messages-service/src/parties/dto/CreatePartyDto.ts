import Joi from 'joi';

export interface CreatePartyDto {
  name: string;
}

export const CreatePartySchema = Joi.object<CreatePartyDto>({
  name: Joi.string().max(50).required().messages({
    'any.required': 'Name is required',
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty',
    'string.max': 'Name cannot exceed 50 characters',
  }),
});
