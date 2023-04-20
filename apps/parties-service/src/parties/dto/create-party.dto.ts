import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePartyDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
