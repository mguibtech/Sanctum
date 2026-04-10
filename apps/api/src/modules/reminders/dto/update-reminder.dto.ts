export class UpdateReminderDto {
  title?: string;
  timeOfDay?: string;
  timezone?: string;
  daysOfWeek?: string;
  routineId?: string | null;
  isEnabled?: boolean;
}
