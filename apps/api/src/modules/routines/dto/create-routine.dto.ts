import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const ROUTINE_TYPES = ['MORNING', 'NIGHT', 'BIBLE', 'ROSARY', 'CUSTOM'] as const;

export class CreateRoutineDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ROUTINE_TYPES)
  type?: (typeof ROUTINE_TYPES)[number];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  estimatedMinutes?: number;
}
