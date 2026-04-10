import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SavePassageDto {
  @IsString()
  bookId: string;

  @IsString()
  bookName: string;

  @IsInt()
  @Min(1)
  chapterNum: number;

  @IsInt()
  @Min(1)
  verseStart: number;

  @IsInt()
  @Min(1)
  verseEnd: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
