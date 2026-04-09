import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class CompleteLiturgyDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsBoolean()
  @IsOptional()
  contemplated?: boolean;
}
