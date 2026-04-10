export class CreateGroupDto {
  name: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'PARISH_ONLY';
  parishId?: string;
}
