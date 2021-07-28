import { IsBoolean, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePartyDto {
  @IsString({
    message: 'name must be a string',
  })
  @MinLength(1, {
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
