import Joi from 'joi';

export interface CreateTopicDto {
  name: string;
}

export const CreateTopicSchema = Joi.object<CreateTopicDto>({
  name: Joi.string().max(50).required().messages({
    'any.required': 'Name is required',
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty',
    'string.max': 'Name cannot exceed 50 characters',
  }),
});
