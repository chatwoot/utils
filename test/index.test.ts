import format from 'date-fns/format';
import {
  getContrastingTextColor,
  formatDate,
  formatTime,
  trimContent,
  formatNumber,
} from '../src';

describe('#getContrastingTextColor', () => {
  it('it should return white color code if #DF4CAB color passed  ', () => {
    expect(getContrastingTextColor('#DF4CAB')).toEqual('#FFFFFF');
  });
  it('it should return black color code if #7DD5FF color passed  ', () => {
    expect(getContrastingTextColor('#7DD5FF')).toEqual('#000000');
  });
});

describe('#formatDate', () => {
  const today = new Date();
  it('it should return formatted date if date is passed  ', () => {
    expect(
      formatDate({
        date: 'Jun 09, 2021',
        todayText: 'Today',
        yesterdayText: 'Yesterday',
      })
    ).toEqual('Jun 09, 2021');
  });
  it('it should return yesterday if yesterday date is passed  ', () => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const date = format(yesterday, 'MMM d, yyyy');
    expect(
      formatDate({
        date,
        todayText: 'Today',
        yesterdayText: 'Yesterday',
      })
    ).toEqual('Yesterday');
  });
  it('it should return today if today date is passed  ', () => {
    const date = format(today, 'MMM d, yyyy');
    expect(
      formatDate({
        date,
        todayText: 'Today',
        yesterdayText: 'Yesterday',
      })
    ).toEqual('Today');
  });
});

describe('#formatTime', () => {
  it('it should return time in seconds format if time is less than 60 seconds  ', () => {
    const start_time = new Date().getTime();
    const end_time = new Date(
      new Date().setSeconds(new Date().getSeconds() + 30)
    ).getTime();
    expect(formatTime((end_time - start_time) / 1000)).toEqual('30 Sec');
  });

  it('it should return time in minutes format if time is greater than 60 seconds and less than 3600 seconds', () => {
    const start_time = new Date().getTime();
    const end_time = new Date(
      new Date().setSeconds(new Date().getSeconds() + 400)
    ).getTime();
    expect(formatTime((end_time - start_time) / 1000)).toEqual('6 Min 40 Sec');
  });

  it('it should return time in Hour and Minute format if time is greater than 3600 seconds less than 86400 seconds ', () => {
    const start_time = new Date().getTime();
    const end_time = new Date(
      new Date().setSeconds(new Date().getSeconds() + 7800)
    ).getTime();
    expect(formatTime((end_time - start_time) / 1000)).toEqual('2 Hr 10 Min');
  });

  it('it should return time in Day and Hour format if time is greater than 86400 seconds', () => {
    const start_time = new Date().getTime();
    const end_time = new Date(
      new Date().setSeconds(new Date().getSeconds() + 180600)
    ).getTime();
    expect(formatTime((end_time - start_time) / 1000)).toEqual('2 Day 2 Hr');
  });
});

describe('#trimContent', () => {
  it('trims the string to proper length', () => {
    expect(trimContent('this is an example')).toEqual('this is an example');
    expect(trimContent('this is an example', 3)).toEqual('thi');
  });
  it('adds ellipsis if passed', () => {
    expect(trimContent('this is an example', 3, true)).toEqual('thi...');
  });
});

describe('#formatNumber', () => {
  it('should format numbers less than 1000 without suffix', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(500)).toBe('500');
  });

  it('should format thousands with k suffix', () => {
    expect(formatNumber(1000)).toBe('1K');
    expect(formatNumber(1234)).toBe('1.2K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(9999)).toBe('10K');
    expect(formatNumber(10000)).toBe('10K');
    expect(formatNumber(999999)).toBe('1M');
  });

  it('should format millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1M');
    expect(formatNumber(1234567)).toBe('1.2M');
    expect(formatNumber(9999999)).toBe('10M');
    expect(formatNumber(12345678)).toBe('12.3M');
  });

  it('should handle decimal inputs', () => {
    expect(formatNumber(1234.5)).toBe('1.2K');
    expect(formatNumber(1999.99)).toBe('2K');
    expect(formatNumber(1000000.5)).toBe('1M');
  });

  it('should handle string number inputs', () => {
    expect(formatNumber('1234')).toBe('1.2K');
    expect(formatNumber('1000000')).toBe('1M');
    expect(formatNumber('999')).toBe('999');
    expect(formatNumber('-1234')).toBe('-1.2K');
  });

  it('should handle invalid string inputs', () => {
    expect(formatNumber('abc')).toBe('0');
    expect(formatNumber('')).toBe('0');
    expect(formatNumber('  ')).toBe('0');
    expect(formatNumber('12abc34')).toBe('0');
  });

  it('should handle null and undefined and NaN', () => {
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber(undefined)).toBe('0');
    expect(formatNumber(NaN)).toBe('0');
  });
});
