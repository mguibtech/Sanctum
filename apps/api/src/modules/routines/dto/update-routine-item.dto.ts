import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateRoutineItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;

  @IsOptional()
  @IsString()
  itemType?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  estimatedMinutes?: number;

  @IsOptional()
  metadataJson?: unknown;
}
