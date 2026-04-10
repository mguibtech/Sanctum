export class UpdateGroupDto {
  name?: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'PARISH_ONLY';
}
