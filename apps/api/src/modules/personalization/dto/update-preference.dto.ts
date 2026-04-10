export class UpdatePreferenceDto {
  preferredFormat?: 'AUDIO' | 'TEXT' | 'MIXED';
  sessionLength?: 'SHORT' | 'MEDIUM' | 'LONG';
  focusArea?: 'PEACE' | 'BIBLE' | 'ROSARY' | 'LITURGY' | 'SLEEP' | 'BEGINNER';
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  notifyMorning?: boolean;
  notifyNight?: boolean;
  timezone?: string;
}
