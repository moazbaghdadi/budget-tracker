import { describe, it, expect } from 'vitest';
import { destNameFor, extractExt } from './attachments';

describe('extractExt', () => {
  it('returns the substring after the last dot', () => {
    expect(extractExt('invoice.pdf')).toBe('pdf');
    expect(extractExt('photo.JPG')).toBe('JPG');
  });

  it('handles multiple dots — only the trailing extension counts', () => {
    expect(extractExt('archive.tar.gz')).toBe('gz');
    expect(extractExt('my.file.name.txt')).toBe('txt');
  });

  it('returns empty string when there is no extension', () => {
    expect(extractExt('README')).toBe('');
    expect(extractExt('file.')).toBe('');
  });

  it('treats hidden files without a second dot as extension-less', () => {
    expect(extractExt('.env')).toBe('');
    expect(extractExt('.gitignore')).toBe('');
  });

  it('keeps the extension on hidden files that do have one', () => {
    expect(extractExt('.config.json')).toBe('json');
  });
});

describe('destNameFor', () => {
  it('joins id and ext with a dot', () => {
    expect(destNameFor({ id: 'abc-123', filename: 'x.pdf', ext: 'pdf' })).toBe('abc-123.pdf');
  });

  it('omits the dot when ext is empty', () => {
    expect(destNameFor({ id: 'abc-123', filename: 'README', ext: '' })).toBe('abc-123');
  });
});
