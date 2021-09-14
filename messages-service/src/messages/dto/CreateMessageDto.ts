import Joi from 'joi';

export interface CreateMessageDto {
  body: string;
}

export const CreateMessageSchema = Joi.object<CreateMessageDto>({
  body: Joi.string().max(50).required().messages({
    'any.required': 'Body is required',
    'string.base': 'Body must be a string',
    'string.empty': 'Body cannot be empty',
  }),
});
