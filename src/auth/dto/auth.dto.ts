import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LocalLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4)
  password!: string;
}

export class LocalSignUpDto {
  @Type(() => String)
  @IsEmail()
  email!: string;

  @MinLength(8)
  @MaxLength(64)
  @Matches(/[!@#$%^&*]/, {
    message: '특수문자를 최소 1개 포함해야 합니다.',
  })
  password!: string;

  @IsString()
  @MaxLength(6)
  name!: string;
}
