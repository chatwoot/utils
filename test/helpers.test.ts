import { convertSecondsToTimeUnit } from '../src/helpers';

describe('#convertSecondsToTimeUnit', () => {
  it("it should return { time:  1, unit: 'm' } if  60 seconds passed", () => {
    expect(
      convertSecondsToTimeUnit(60, { minute: 'm', hour: 'h', day: 'd' })
    ).toEqual({ time: 1, unit: 'm' });
  });
  it("it should return { time:  1, unit: 'Minutes' } if  60 seconds passed", () => {
    expect(
      convertSecondsToTimeUnit(60, {
        minute: 'Minutes',
        hour: 'Hours',
        day: 'Days',
      })
    ).toEqual({ time: 1, unit: 'Minutes' });
  });
  it("it should return { time:  1, unit: 'h' } if  3600 seconds passed", () => {
    expect(
      convertSecondsToTimeUnit(3600, { minute: 'm', hour: 'h', day: 'd' })
    ).toEqual({ time: 1, unit: 'h' });
  });
  it("it should return { time:  1, unit: 'Hours' } if  3600 seconds passed", () => {
    expect(
      convertSecondsToTimeUnit(3600, {
        minute: 'Minutes',
        hour: 'Hours',
        day: 'Days',
      })
    ).toEqual({ time: 1, unit: 'Hours' });
  });
  it("it should return { time:  1, unit: 'd' } if  86400 seconds passed", () => {
    expect(
      convertSecondsToTimeUnit(86400, { minute: 'm', hour: 'h', day: 'd' })
    ).toEqual({ time: 1, unit: 'd' });
  });
  it("it should return { time:  1, unit: 'Days' } if  86400 seconds passed", () => {
    expect(
      convertSecondsToTimeUnit(86400, {
        minute: 'Minutes',
        hour: 'Hours',
        day: 'Days',
      })
    ).toEqual({ time: 1, unit: 'Days' });
  });
});
