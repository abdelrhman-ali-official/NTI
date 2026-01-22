import { Pipe, PipeTransform } from '@angular/core';
import { convertToEgyptTime } from '../utils/date-converter.util';

/**
 * Custom pipe to convert UTC dates from backend to Egypt Time (UTC+2)
 * Usage: {{ utcDate | egyptDate:'short' }}
 */
@Pipe({
  name: 'egyptDate',
  standalone: true
})
export class EgyptDatePipe implements PipeTransform {
  transform(value: string | null | undefined, format: string = 'short'): string {
    if (!value) return '-';

    try {
      const egyptDate = convertToEgyptTime(value);

      switch (format) {
        case 'short':
          return egyptDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        case 'shortTime':
          return egyptDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });
        case 'fullDate':
          return egyptDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        case 'medium':
          return egyptDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        case 'MMM dd, yyyy':
          return egyptDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        default:
          return egyptDate.toLocaleString('en-US');
      }
    } catch (error) {
      console.error('Error converting date to Egypt time:', error);
      return '-';
    }
  }
}
