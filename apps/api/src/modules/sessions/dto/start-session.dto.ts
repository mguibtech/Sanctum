import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const SESSION_SOURCE_TYPES = [
  'ROUTINE',
  'LITURGY',
  'BIBLE',
  'ROSARY',
  'GUIDED_SESSION',
  'CAMPAIGN',
  'FREE_PRAYER',
] as const;

export class StartSessionDto {
  @IsEnum(SESSION_SOURCE_TYPES)
  sourceType!: (typeof SESSION_SOURCE_TYPES)[number];

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsBoolean()
  contemplated?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(86400)
  durationSeconds?: number;
}
