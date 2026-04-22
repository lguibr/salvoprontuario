import { addDays, getDay, parseISO, setHours, setMinutes, isAfter, startOfDay } from 'date-fns';

/**
 * Generates an array of session timestamps based on recurring weekdays.
 * @param startDateStr 'YYYY-MM-DD'
 * @param timeStr 'HH:mm'
 * @param selectedDays Array of 0-6 (0=Sun, 1=Mon, ..., 6=Sat)
 * @param numberOfSessions How many sessions to generate
 */
export function generateSessions(
  startDateStr: string,
  timeStr: string,
  selectedDays: number[],
  numberOfSessions: number
): number[] {
  if (selectedDays.length === 0 || !startDateStr || !timeStr || numberOfSessions <= 0) {
    return [];
  }

  const [hours, minutes] = timeStr.split(':').map(Number);
  let currentDate = parseISO(startDateStr);
  const generated: number[] = [];

  // Start from the given date. We don't rewind.
  // Check day of week. If current date is valid, add it.
  // Iterate forward day by day.
  
  // We want to avoid infinite loops, so if somehow things break, hard cap
  const maxIterations = 365; 
  let iterations = 0;

  while (generated.length < numberOfSessions && iterations < maxIterations) {
    iterations++;
    const currentDay = getDay(currentDate);
    
    if (selectedDays.includes(currentDay)) {
      const dateTime = setMinutes(setHours(currentDate, hours), minutes);
      generated.push(dateTime.getTime());
    }
    
    currentDate = addDays(currentDate, 1);
  }

  return generated;
}
