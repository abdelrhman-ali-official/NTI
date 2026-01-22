/**
 * Utility functions for converting UTC dates to Egypt Time (UTC+2)
 */

/**
 * Converts a UTC date string to Egypt Time (UTC+2)
 * @param utcDateString - The UTC date string from the backend
 * @returns Date object adjusted to Egypt Time (UTC+2)
 */
export function convertToEgyptTime(utcDateString: string): Date {
  const utcDate = new Date(utcDateString);
  // Add 2 hours (7200000 milliseconds) to convert from UTC to UTC+2
  const egyptTime = new Date(utcDate.getTime() + (2 * 60 * 60 * 1000));
  return egyptTime;
}

/**
 * Converts Egypt Time (UTC+2) to UTC for sending to backend
 * @param egyptTimeString - The local date-time string from datetime-local input
 * @returns ISO string in UTC
 */
export function convertEgyptTimeToUTC(egyptTimeString: string): string {
  // Create a date from the local input (which is in Egypt time)
  const localDate = new Date(egyptTimeString);
  // Subtract 2 hours to convert from Egypt time to UTC
  const utcDate = new Date(localDate.getTime() - (2 * 60 * 60 * 1000));
  return utcDate.toISOString();
}

/**
 * Converts UTC date to Egypt Time for datetime-local input
 * @param utcDateString - The UTC date string from the backend
 * @returns String formatted for datetime-local input (yyyy-MM-ddThh:mm)
 */
export function convertUTCToEgyptTimeInput(utcDateString: string): string {
  const egyptDate = convertToEgyptTime(utcDateString);
  // Format as yyyy-MM-ddThh:mm for datetime-local input
  return egyptDate.toISOString().slice(0, 16);
}

/**
 * Formats a UTC date string to Egypt Time date string
 * @param utcDateString - The UTC date string from the backend
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string in Egypt Time
 */
export function formatEgyptDate(
  utcDateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string {
  const egyptDate = convertToEgyptTime(utcDateString);
  return egyptDate.toLocaleDateString('en-US', options);
}

/**
 * Formats a UTC date string to Egypt Time time string
 * @param utcDateString - The UTC date string from the backend
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted time string in Egypt Time
 */
export function formatEgyptTime(
  utcDateString: string,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }
): string {
  const egyptDate = convertToEgyptTime(utcDateString);
  return egyptDate.toLocaleTimeString('en-US', options);
}

/**
 * Formats a UTC date string to Egypt Time date-time string
 * @param utcDateString - The UTC date string from the backend
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date-time string in Egypt Time
 */
export function formatEgyptDateTime(
  utcDateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }
): string {
  const egyptDate = convertToEgyptTime(utcDateString);
  return egyptDate.toLocaleString('en-US', options);
}
