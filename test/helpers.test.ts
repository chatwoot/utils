import { convertSecondsToTimeUnit, fileNameWithEllipsis } from '../src/helpers';

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
  it("it should return { time:  '', unit: '' } if seconds passed is 0", () => {
    expect(
      convertSecondsToTimeUnit(0, { minute: 'm', hour: 'h', day: 'd' })
    ).toEqual({ time: '', unit: '' });
  });
});

describe('fileNameWithEllipsis', () => {
  it('should return original filename if name length is within limit', () => {
    const file = { name: 'document.pdf' };
    expect(fileNameWithEllipsis(file)).toBe('document.pdf');
  });

  it('should truncate filename if it exceeds max length', () => {
    const file = { name: 'very-long-filename-that-needs-truncating.pdf' };
    expect(fileNameWithEllipsis(file)).toBe('very-long-filename-that-ne….pdf');
  });

  it('should handle files without extension', () => {
    const file = { name: 'README' };
    expect(fileNameWithEllipsis(file)).toBe('README');
  });

  it('should handle files with multiple dots', () => {
    const file = { name: 'archive.tar.gz' };
    expect(fileNameWithEllipsis(file)).toBe('archive.tar.gz');
  });

  it('should handle hidden files', () => {
    const file = { name: '.gitignore' };
    expect(fileNameWithEllipsis(file)).toBe('.gitignore');
  });

  it('should handle both filename and name properties', () => {
    const file = {
      filename: 'from-filename.pdf',
      name: 'from-name.pdf',
    };
    expect(fileNameWithEllipsis(file)).toBe('from-filename.pdf');
  });

  it('should handle special characters', () => {
    const file = { name: 'résumé-2023_final-version.doc' };
    expect(fileNameWithEllipsis(file)).toBe('résumé-2023_final-version.doc');
  });

  it('should handle very short filenames', () => {
    const file = { name: 'a.txt' };
    expect(fileNameWithEllipsis(file)).toBe('a.txt');
  });
});
