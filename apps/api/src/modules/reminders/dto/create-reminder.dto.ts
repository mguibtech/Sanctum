export class CreateReminderDto {
  title: string;
  timeOfDay: string; // HH:mm format
  timezone?: string; // default: UTC
  daysOfWeek: string; // comma-separated: 0-6 (Sunday-Saturday) or empty for daily
  routineId?: string; // optional link to a routine
}
