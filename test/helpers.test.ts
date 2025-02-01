import {
  convertSecondsToTimeUnit,
  fileNameWithEllipsis,
  splitName,
  downloadFile,
  getFileInfo,
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
      style: '',
    };
    document.createElement = jest.fn().mockReturnValue(mockDOMElement);
    document.body.append = jest.fn();
  });

  afterEach(() => jest.clearAllMocks());

  describe('successful downloads', () => {
    it('should download PDF file with correct fetch options', async () => {
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

      expect(mockFetch).toHaveBeenCalledWith('test.com/doc.pdf', {
        cache: 'no-store',
      });
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockDOMElement.click).toHaveBeenCalled();
    });

    it('should download file with content disposition filename', async () => {
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
      expect(document.body.append).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('error handling', () => {
    it('should throw error if url or type missing', async () => {
      await expect(downloadFile({ url: '', type: 'pdf' })).rejects.toThrow(
        'Invalid download parameters'
      );

      await expect(downloadFile({ url: 'test.com', type: '' })).rejects.toThrow(
        'Invalid download parameters'
      );

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw error on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        downloadFile({ url: 'test.com/file', type: 'pdf' })
      ).rejects.toThrow('Download failed: 404');
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        downloadFile({ url: 'test.com/file', type: 'pdf' })
      ).rejects.toThrow('Network error');
    });
  });
});

describe('getFileInfo', () => {
  describe('normal cases', () => {
    it('should extract info from a basic filename', () => {
      expect(getFileInfo('https://example.com/document.pdf')).toEqual({
        name: 'document.pdf',
        type: 'pdf',
        base: 'document',
      });
    });

    it('should handle filenames with spaces', () => {
      expect(getFileInfo('https://example.com/My Document.pdf')).toEqual({
        name: 'My Document.pdf',
        type: 'pdf',
        base: 'My Document',
      });
    });

    it('should convert file type to lowercase', () => {
      expect(getFileInfo('https://example.com/image.PNG')).toEqual({
        name: 'image.PNG',
        type: 'png',
        base: 'image',
      });
    });

    it('should handle multiple dots in filename', () => {
      expect(getFileInfo('https://example.com/archive.tar.gz')).toEqual({
        name: 'archive.tar.gz',
        type: 'gz',
        base: 'archive.tar',
      });
    });
  });

  describe('URL handling', () => {
    it('should handle URL encoded characters', () => {
      expect(
        getFileInfo('https://example.com/My%20Document%20Name.pdf')
      ).toEqual({
        name: 'My Document Name.pdf',
        type: 'pdf',
        base: 'My Document Name',
      });
    });

    it('should handle full URLs with query parameters', () => {
      expect(
        getFileInfo('https://example.com/doc.pdf?version=1&type=latest')
      ).toEqual({
        name: 'doc.pdf',
        type: 'pdf',
        base: 'doc',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle files without extension', () => {
      expect(getFileInfo('https://example.com/README')).toEqual({
        name: 'README',
        type: '',
        base: 'README',
      });
    });

    it('should handle hidden files', () => {
      expect(getFileInfo('https://example.com/.gitignore')).toEqual({
        name: '.gitignore',
        type: '',
        base: '.gitignore',
      });
    });

    it('should handle files starting with a dot', () => {
      expect(getFileInfo('https://example.com/.env.local')).toEqual({
        name: '.env.local',
        type: 'local',
        base: '.env',
      });
    });

    it('should handle files with multiple dots', () => {
      expect(
        getFileInfo('https://example.com/development.config.yaml')
      ).toEqual({
        name: 'development.config.yaml',
        type: 'yaml',
        base: 'development.config',
      });
    });

    it('should handle empty file names', () => {
      expect(getFileInfo('https://example.com/')).toEqual({
        name: 'Unknown File',
        type: '',
        base: 'Unknown File',
      });
    });

    it('should handle whitespace in filenames', () => {
      expect(getFileInfo('https://example.com/  spaced  .pdf')).toEqual({
        name: '  spaced  .pdf',
        type: 'pdf',
        base: '  spaced  ',
      });
    });

    it('should handle null input', () => {
      // @ts-ignore: testing null input
      expect(getFileInfo(null)).toEqual({
        name: 'Unknown File',
        type: '',
        base: 'Unknown File',
      });
    });

    it('should handle undefined input', () => {
      // @ts-ignore: testing undefined input
      expect(getFileInfo(undefined)).toEqual({
        name: 'Unknown File',
        type: '',
        base: 'Unknown File',
      });
    });

    it('should handle empty string input', () => {
      expect(getFileInfo('')).toEqual({
        name: 'Unknown File',
        type: '',
        base: 'Unknown File',
      });
    });
  });
});
