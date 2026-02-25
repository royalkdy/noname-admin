import { IsEmail, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @Type(() => Number)
  @IsInt()
  id!: number;
}

export class LocalLoginDto {
  @Type(() => String)
  @IsEmail()
  email!: string;
  @IsString()
  password!: string;
}

export class LocalSignUpDto {
  @Type(() => String)
  @IsEmail()
  email!: string;
  @Type(() => String)
  @IsString()
  password!: string;
}
