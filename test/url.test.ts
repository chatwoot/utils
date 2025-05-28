import { toURL, isSameHost } from '../src';

describe('toURL', () => {
  it('returns null for falsy inputs', () => {
    expect(toURL(null)).toBeNull();
    expect(toURL(undefined)).toBeNull();
    expect(toURL('')).toBeNull();
  });

  it('returns the same URL object if URL instance is passed', () => {
    const url = new URL('https://example.com');
    expect(toURL(url)).toBe(url);
  });

  it('converts domain strings to URLs with https protocol', () => {
    const result = toURL('example.com');
    expect(result).toBeInstanceOf(URL);
    expect(result?.href).toBe('https://example.com/');
  });

  it('converts relative paths to URLs with window.location.origin', () => {
    const originalOrigin = window.location.origin;

    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        origin: 'https://test.com',
      },
      writable: true,
    });

    const result = toURL('/path/to/resource');
    expect(result).toBeInstanceOf(URL);
    expect(result?.href).toBe('https://test.com/path/to/resource');

    // Restore original
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        origin: originalOrigin,
      },
      writable: true,
    });
  });

  it('converts full URLs to URL objects', () => {
    const result = toURL('http://example.org/path?query=string#hash');
    expect(result).toBeInstanceOf(URL);
    expect(result?.href).toBe('http://example.org/path?query=string#hash');
  });

  it('returns null for invalid URLs', () => {
    const result = toURL('not a url://example');
    expect(result).toBeNull();
  });
});

describe('isSameHost', () => {
  it('returns false for falsy inputs', () => {
    expect(isSameHost(null, 'example.com')).toBe(false);
    expect(isSameHost('example.com', null)).toBe(false);
    expect(isSameHost('', '')).toBe(false);
  });

  it('returns true for URLs with the same host', () => {
    expect(
      isSameHost('https://example.com/path1', 'https://example.com/path2')
    ).toBe(true);
    expect(isSameHost('http://example.com', 'https://example.com')).toBe(true);
    expect(isSameHost('example.com', 'example.com/path')).toBe(true);
  });

  it('returns false for URLs with different hosts', () => {
    expect(isSameHost('example1.com', 'example2.com')).toBe(false);
    expect(isSameHost('sub.example.com', 'example.com')).toBe(false);
    expect(isSameHost('example.com', 'example.org')).toBe(false);
  });

  it('handles URL objects correctly', () => {
    const url1 = new URL('https://example.com/path');
    const url2 = new URL('https://example.com/other');
    const url3 = new URL('https://other.com');

    expect(isSameHost(url1, url2)).toBe(true);
    expect(isSameHost(url1, url3)).toBe(false);
  });
});
