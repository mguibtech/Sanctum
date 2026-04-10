export class CreateCampaignDto {
  slug: string;
  title: string;
  description?: string;
  category: string; // LENT, ADVENT, NOVENA, ROSARY
  hostType: string; // GLOBAL, PARISH, GROUP, USER
  hostId?: string; // parishId, groupId, userId
  startDate: Date;
  endDate: Date;
  goalType: 'PARTICIPANTS' | 'PRAYERS' | 'DAYS_COMPLETED';
  goalValue: number;
  coverImageUrl?: string;
}
