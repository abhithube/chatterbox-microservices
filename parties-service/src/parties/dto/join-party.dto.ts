import { IsUUID } from 'class-validator';

export class JoinPartyDto {
  @IsUUID(4, {
    message: 'token must be a valid UUID',
  })
  token: string;
}
