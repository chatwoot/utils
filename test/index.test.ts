import format from 'date-fns/format';
import { getContrastingTextColor, formatDate, formatTime } from '../src';

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
    const end_time = new Date(new Date().setSeconds(new Date().getSeconds()+30)).getTime();
    expect(formatTime((end_time - start_time)/1000)).toEqual('30 Sec');
  });

  it('it should return time in minutes format if time is greater than 60 seconds and less than 3600 seconds', () => {
    const start_time = new Date().getTime();
    const end_time = new Date(new Date().setSeconds(new Date().getSeconds()+400)).getTime();
    expect(formatTime((end_time - start_time)/1000)).toEqual('7 Min');
  });

  it('it should return time in Hour and Minute format if time is greater than 3600 seconds less than 86400 seconds ', () => {
    const start_time = new Date().getTime();
    const end_time = new Date(new Date().setSeconds(new Date().getSeconds()+7800)).getTime();
    expect(formatTime((end_time - start_time)/1000)).toEqual('2 Hr 10 Min');
  });

  it('it should return time in Day and Hour format if time is greater than 86400 seconds', () => {
    const start_time = new Date().getTime();
    const end_time = new Date(new Date().setSeconds(new Date().getSeconds()+180600)).getTime();
    expect(formatTime((end_time - start_time)/1000)).toEqual('2 Day 2 Hr');
  });
});
