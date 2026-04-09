import { IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreatePrayerRequestDto {
  @IsString()
  @MinLength(10, { message: 'Pedido muito curto' })
  @MaxLength(500, { message: 'Pedido muito longo (máx 500 caracteres)' })
  content: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}
