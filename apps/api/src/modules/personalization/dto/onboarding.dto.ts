export class OnboardingDto {
  preferredFormat: 'AUDIO' | 'TEXT' | 'MIXED';
  sessionLength: 'SHORT' | 'MEDIUM' | 'LONG';
  focusArea: 'PEACE' | 'BIBLE' | 'ROSARY' | 'LITURGY' | 'SLEEP' | 'BEGINNER';
  interests: string[];
  timezone?: string;
  notifyMorning?: boolean;
  notifyNight?: boolean;
}
