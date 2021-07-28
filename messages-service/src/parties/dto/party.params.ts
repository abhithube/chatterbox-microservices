import { IsHexadecimal, Length } from 'class-validator';

export class PartyParams {
  @IsHexadecimal({
    message: 'id must be a valid hex string',
  })
  @Length(24, 24, {
    message: 'id must be a valid BSON ObjectId',
  })
  id: string;
}
