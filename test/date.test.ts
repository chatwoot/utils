import { coerceToDate } from '../src/date';

describe('coerceToDate', () => {
  describe('null and undefined inputs', () => {
    it('should return null for null input', () => {
      expect(coerceToDate(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(coerceToDate(undefined)).toBeNull();
    });
  });

  describe('numeric timestamp inputs', () => {
    it('should handle 10-digit Unix timestamps (seconds)', () => {
      const timestamp = 1748834578; // 10 digits
      const result = coerceToDate(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(timestamp * 1000);
    });

    it('should handle 13-digit Unix timestamps (milliseconds)', () => {
      const timestamp = 1748834578000; // 13 digits
      const result = coerceToDate(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(timestamp);
    });

    it('should handle edge case timestamps', () => {
      const zeroTimestamp = 0;
      const result = coerceToDate(zeroTimestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(0);
    });
  });

  describe('string timestamp inputs', () => {
    it('should handle string representation of 10-digit timestamps', () => {
      const timestampStr = '1748834578';
      const result = coerceToDate(timestampStr);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(1748834578 * 1000);
    });

    it('should handle string representation of 13-digit timestamps', () => {
      const timestampStr = '1748834578000';
      const result = coerceToDate(timestampStr);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(1748834578000);
    });

    it('should return null for non-numeric strings that look like timestamps', () => {
      expect(coerceToDate('123abc')).toBeNull();
      expect(coerceToDate('abc123')).toBeNull();
    });
  });

  describe('ISO date string inputs', () => {
    it('should handle ISO date strings with time', () => {
      const isoString = '2025-06-01T12:30:00Z';
      const result = coerceToDate(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe('2025-06-01T12:30:00.000Z');
    });

    it('should handle ISO date strings with timezone offset', () => {
      const isoString = '2025-06-01T12:30:00+05:30';
      const result = coerceToDate(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe('2025-06-01T07:00:00.000Z');
    });
  });

  describe('simple date string inputs', () => {
    it('should handle simple date strings and set time to 00:00:00', () => {
      const dateString = '2025-06-01';
      const result = coerceToDate(dateString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getHours()).toBe(0);
      expect(result?.getMinutes()).toBe(0);
      expect(result?.getSeconds()).toBe(0);
      expect(result?.getMilliseconds()).toBe(0);
    });

    it('should handle date strings with slashes', () => {
      const dateString = '06/01/2025';
      const result = coerceToDate(dateString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(5); // June is month 5 (0-indexed)
      expect(result?.getDate()).toBe(1);
    });
  });

  describe('date strings with space-separated time', () => {
    it('should handle date strings with space and time', () => {
      const dateString = '2025-06-01 12:30:00';
      const result = coerceToDate(dateString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getHours()).toBe(12);
      expect(result?.getMinutes()).toBe(30);
      expect(result?.getSeconds()).toBe(0);
    });

    it('should handle date strings with space and partial time', () => {
      const dateString = '2025-06-01 12:30';
      const result = coerceToDate(dateString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getHours()).toBe(12);
      expect(result?.getMinutes()).toBe(30);
    });
  });

  describe('invalid inputs', () => {
    it('should return null for invalid date strings', () => {
      expect(coerceToDate('invalid-date')).toBeNull();
      expect(coerceToDate('not-a-date')).toBeNull();
      expect(coerceToDate('completely-invalid')).toBeNull();
    });

    it('should return null for empty strings', () => {
      expect(coerceToDate('')).toBeNull();
      expect(coerceToDate('   ')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29';
      const result = coerceToDate(leapYearDate);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(1); // February
      expect(result?.getDate()).toBe(29);
    });

    it('should handle very old dates', () => {
      const oldDate = '1970-01-01';
      const result = coerceToDate(oldDate);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(1970);
    });

    it('should handle future dates', () => {
      const futureDate = '2030-12-31';
      const result = coerceToDate(futureDate);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2030);
      expect(result?.getMonth()).toBe(11); // December
    });
  });

  describe('auto-correcting behavior', () => {
    it('should auto-correct invalid dates like JavaScript Date constructor', () => {
      // Feb 30th gets auto-corrected to March 2nd
      const result = coerceToDate('2025-02-30');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(2); // March (0-indexed)
      expect(result?.getDate()).toBe(2);
    });

    it('should auto-correct overflow in months', () => {
      // Month 13 gets auto-corrected to January of next year
      const result = coerceToDate('2025-13-01');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2026);
      expect(result?.getMonth()).toBe(0); // January
      expect(result?.getDate()).toBe(1);
    });

    it('should auto-correct overflow in hours', () => {
      // 25th hour gets auto-corrected to 1 AM next day
      const result = coerceToDate('2025-06-01T25:00:00');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getDate()).toBe(2);
      expect(result?.getHours()).toBe(1);
    });
  });
});
