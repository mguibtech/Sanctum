import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FinishSessionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(86400)
  durationSeconds?: number;

  @IsOptional()
  @IsBoolean()
  contemplated?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
