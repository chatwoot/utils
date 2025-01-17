import {
  convertSecondsToTimeUnit,
  fileNameWithEllipsis,
  splitName,
  downloadFile,
} from '../src/helpers';

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

describe('splitName', () => {
  it('splits a basic first and last name', () => {
    expect(splitName('John Doe')).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('handles single name', () => {
    expect(splitName('John')).toEqual({
      firstName: 'John',
      lastName: '',
    });
  });

  it('handles empty string', () => {
    expect(splitName('Mary John Ann')).toEqual({
      firstName: 'Mary John',
      lastName: 'Ann',
    });
  });

  it('handles extra whitespace', () => {
    expect(splitName('   Jane    Doe   ')).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
    });
  });
});

describe('downloadFile', () => {
  let mockFetch: jest.Mock;
  let mockCreateObjectURL: jest.Mock;
  let mockDOMElement: { [key: string]: jest.Mock | string };

  beforeEach(() => {
    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // Mock URL methods
    mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = jest.fn();

    // Mock DOM element
    mockDOMElement = {
      click: jest.fn(),
      remove: jest.fn(),
      href: '',
      download: '',
    };
    document.createElement = jest.fn().mockReturnValue(mockDOMElement);
    document.body.append = jest.fn();
  });

  afterEach(() => jest.clearAllMocks());

  describe('successful downloads', () => {
    it('should download PDF file', async () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(blob),
        headers: new Headers({ 'content-type': 'application/pdf' }),
      });

      await downloadFile({
        url: 'test.com/doc.pdf',
        type: 'pdf',
        extension: 'pdf',
      });

      expect(mockFetch).toHaveBeenCalledWith('test.com/doc.pdf');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockDOMElement.click).toHaveBeenCalled();
    });

    it('should download image file with content disposition', async () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(blob),
        headers: new Headers({
          'content-type': 'image/png',
          'content-disposition': 'attachment; filename="test.png"',
        }),
      });

      await downloadFile({
        url: 'test.com/image.png',
        type: 'image',
        extension: 'png',
      });

      expect(mockDOMElement.download).toBe('test.png');
    });
  });

  describe('error handling', () => {
    it('should skip if url or type missing', async () => {
      await downloadFile({ url: '', type: 'pdf' });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await downloadFile({ url: 'test.com/file', type: 'pdf' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Download failed:',
        expect.any(Error)
      );
    });
  });
});
