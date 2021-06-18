import format from 'date-fns/format';
import { getContrastingTextColor, formatDate } from '../src';

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
