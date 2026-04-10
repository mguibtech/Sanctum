import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRoutineItemDto {
  @IsInt()
  @Min(1)
  position!: number;

  @IsString()
  itemType!: string;

  @IsString()
  title!: string;

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
