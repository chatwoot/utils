import { getContrastingTextColor } from '../src';

describe('#getContrastingTextColor', () => {
  it('it should return white color code if #DF4CAB color passed  ', () => {
    expect(getContrastingTextColor('#DF4CAB')).toEqual('#FFFFFF');
  });
  it('it should return black color code if #7DD5FF color passed  ', () => {
    expect(getContrastingTextColor('#7DD5FF')).toEqual('#000000');
  });
});
