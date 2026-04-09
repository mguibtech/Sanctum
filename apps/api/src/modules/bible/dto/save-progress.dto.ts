import { IsString, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class SaveProgressDto {
  @IsString()
  bookId: string;

  @IsString()
  bookName: string;

  @IsInt()
  @Min(1)
  chapterNum: number;

  @IsBoolean()
  @IsOptional()
  contemplated?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  verseStart?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  verseEnd?: number;
}
