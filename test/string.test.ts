import { parseBoolean, sanitizeTextForRender } from '../src';

describe('#parseBoolean', () => {
  test('returns true for input "true"', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('TRUE')).toBe(true);
    expect(parseBoolean('True')).toBe(true);
  });

  test('returns false for input "false"', () => {
    expect(parseBoolean('false')).toBe(false);
    expect(parseBoolean('FALSE')).toBe(false);
    expect(parseBoolean('False')).toBe(false);
  });

  test('returns true for input "1"', () => {
    expect(parseBoolean(1)).toBe(true);
    expect(parseBoolean('1')).toBe(true);
  });

  test('returns false for input "0"', () => {
    expect(parseBoolean(0)).toBe(false);
    expect(parseBoolean('0')).toBe(false);
  });

  test('returns false for input "non-boolean value"', () => {
    expect(parseBoolean('non-boolean value')).toBe(false);
  });

  test('returns false for input "null"', () => {
    // @ts-ignore
    expect(parseBoolean(null)).toBe(false);
  });

  test('returns false for input "undefined"', () => {
    // @ts-ignore
    expect(parseBoolean(undefined)).toBe(false);
  });
});

describe('#sanitizeTextForRender', () => {
  it('should handle null and undefined values', () => {
    expect(sanitizeTextForRender(null)).toBe(null);
    expect(sanitizeTextForRender(undefined)).toBe(undefined);
    expect(sanitizeTextForRender('')).toBe('');
  });

  it('should convert newlines to <br> tags', () => {
    expect(sanitizeTextForRender('Line 1\nLine 2')).toBe('Line 1<br>Line 2');
    expect(sanitizeTextForRender('Multiple\n\nNewlines')).toBe(
      'Multiple<br><br>Newlines'
    );
  });

  it('should escape stray < characters', () => {
    expect(sanitizeTextForRender('if x < 5')).toBe('if x &lt; 5');
    expect(sanitizeTextForRender('< this is not a tag')).toBe(
      '&lt; this is not a tag'
    );
    expect(sanitizeTextForRender('price < $100')).toBe('price &lt; $100');
  });

  it('should escape stray > characters', () => {
    expect(sanitizeTextForRender('if x > 5')).toBe('if x &gt; 5');
    expect(sanitizeTextForRender('this is not a tag >')).toBe(
      'this is not a tag &gt;'
    );
    expect(sanitizeTextForRender('score > 90%')).toBe('score &gt; 90%');
  });

  it('should escape both stray < and > characters', () => {
    expect(sanitizeTextForRender('5 < x < 10')).toBe('5 &lt; x &lt; 10');
    expect(sanitizeTextForRender('x > 5 && y < 10')).toBe(
      'x &gt; 5 && y &lt; 10'
    );
  });

  it('should preserve valid HTML tags', () => {
    expect(sanitizeTextForRender('<div>Hello</div>')).toBe('<div>Hello</div>');
    expect(sanitizeTextForRender('<span class="test">World</span>')).toBe(
      '<span class="test">World</span>'
    );
    expect(sanitizeTextForRender('<br>')).toBe('<br>');
    expect(sanitizeTextForRender('<img src="test.jpg" />')).toBe(
      '<img src="test.jpg" />'
    );
  });

  it('should preserve nested HTML tags', () => {
    expect(sanitizeTextForRender('<div><span>Nested</span></div>')).toBe(
      '<div><span>Nested</span></div>'
    );
    expect(
      sanitizeTextForRender('<ul><li>Item 1</li><li>Item 2</li></ul>')
    ).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
  });

  it('should handle mixed content with valid tags and stray characters', () => {
    expect(sanitizeTextForRender('Price < $100 <strong>on sale</strong>')).toBe(
      'Price &lt; $100 <strong>on sale</strong>'
    );
    expect(sanitizeTextForRender('<p>x > 5</p> and y < 10')).toBe(
      '<p>x &gt; 5</p> and y &lt; 10'
    );
  });

  it('should handle edge cases with malformed HTML-like content', () => {
    expect(sanitizeTextForRender('<<invalid>>')).toBe('&lt;<invalid>&gt;');
    expect(sanitizeTextForRender('<not a tag')).toBe('&lt;not a tag');
    expect(sanitizeTextForRender('not a tag>')).toBe('not a tag&gt;');
  });

  it('should handle email addresses and URLs with angle brackets', () => {
    expect(sanitizeTextForRender('Contact: <user@example.com>')).toBe(
      'Contact: &lt;user@example.com&gt;'
    );
    expect(sanitizeTextForRender('Email me at < user@example.com >')).toBe(
      'Email me at &lt; user@example.com &gt;'
    );
  });

  it('should handle mathematical expressions', () => {
    expect(sanitizeTextForRender('if (x < y && y > z)')).toBe(
      'if (x &lt; y && y &gt; z)'
    );
    expect(sanitizeTextForRender('array[i] < array[j]')).toBe(
      'array[i] &lt; array[j]'
    );
  });

  it('should handle HTML entities within valid tags', () => {
    expect(sanitizeTextForRender('<div>&lt;escaped&gt;</div>')).toBe(
      '<div>&lt;escaped&gt;</div>'
    );
    expect(sanitizeTextForRender('<span>already &amp; escaped</span>')).toBe(
      '<span>already &amp; escaped</span>'
    );
  });

  it('should handle complex real-world email content', () => {
    const emailContent = `Hello,\n\nThe price is < $50 for items where quantity > 10.\n<p>Best regards,</p>\n<strong>Sales Team</strong>`;
    const expected = `Hello,<br><br>The price is &lt; $50 for items where quantity &gt; 10.<br><p>Best regards,</p><br><strong>Sales Team</strong>`;
    expect(sanitizeTextForRender(emailContent)).toBe(expected);
  });

  it('should handle quoted email content', () => {
    const quoted = `Original message:\n> User wrote: x < 5\n<blockquote>Previous reply</blockquote>`;
    const expected = `Original message:<br>&gt; User wrote: x &lt; 5<br><blockquote>Previous reply</blockquote>`;
    expect(sanitizeTextForRender(quoted)).toBe(expected);
  });

  it('should handle self-closing tags correctly', () => {
    expect(sanitizeTextForRender('<br />')).toBe('<br />');
    expect(sanitizeTextForRender('<img src="test.jpg" />')).toBe('<img src="test.jpg" />');
    expect(sanitizeTextForRender('<input type="text" value="test" />')).toBe('<input type="text" value="test" />');
    expect(sanitizeTextForRender('<hr/>')).toBe('<hr/>');
    expect(sanitizeTextForRender('Text before <br /> text after')).toBe('Text before <br /> text after');
    expect(sanitizeTextForRender('<meta charset="UTF-8" />')).toBe('<meta charset="UTF-8" />');
  });

  it('should handle complex URLs in attributes', () => {
    expect(sanitizeTextForRender('<img src="https://example.com/image.jpg?width=100&height=200&format=webp" />')).toBe('<img src="https://example.com/image.jpg?width=100&height=200&format=webp" />');
    expect(sanitizeTextForRender('<a href="https://api.example.com/v2/users/123/profile?include=posts&sort=desc">Profile</a>')).toBe('<a href="https://api.example.com/v2/users/123/profile?include=posts&sort=desc">Profile</a>');
    expect(sanitizeTextForRender('<iframe src="//cdn.example.com/embed/video/12345?autoplay=1&loop=0" />')).toBe('<iframe src="//cdn.example.com/embed/video/12345?autoplay=1&loop=0" />');
  });
});
