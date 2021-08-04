import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePartyDto {
  @IsString({
    message: 'name must be a string',
  })
  @IsNotEmpty({
    message: 'name cannot be empty',
  })
  @MaxLength(50, {
    message: 'name cannot exceed 50 characters',
  })
  name: string;

  @IsBoolean({
    message: 'visible must be a boolean',
  })
  visible: boolean;
}
