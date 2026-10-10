import test from 'node:test';
import assert from 'node:assert/strict';
import { externalUrl, resumeUrl } from '../src/lib/urls.ts';

test('external links allow HTTPS and a single email address', () => {
  assert.equal(externalUrl('https://github.com/example/repo'), 'https://github.com/example/repo');
  assert.equal(externalUrl('https://www.linkedin.com/in/example/'), 'https://www.linkedin.com/in/example/');
  assert.equal(externalUrl('mailto:hello@example.com'), 'mailto:hello@example.com');
});
test('unsafe, malformed, credential-bearing and injected URLs never become links', () => {
  for (const value of ['', 'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,test', 'vbscript:test', 'file:///tmp/a', '//evil.example', '/relative', 'http://example.com', 'https://user:password@example.com', ' https://example.com', 'https://exa\nmple.com', 'mailto:hello@example.com?body=test', 'mailto:a@example.com%0d%0aBcc:b@example.com']) {
    assert.equal(externalUrl(value), undefined, value);
  }
});
test('resume paths work at root, relative bases and repository subdirectories', () => {
  for (const base of ['/', './', '/portfolio/', '/portfolio']) {
    assert.equal(resumeUrl('/resume/My-Resume.pdf', base, 'pdf'), `${base.replace(/\/$/, '')}/resume/My-Resume.pdf`);
    assert.equal(resumeUrl('resume/My-Resume.docx', base, 'docx'), `${base.replace(/\/$/, '')}/resume/My-Resume.docx`);
  }
});
test('resume links reject traversal, encoded traversal, remote URLs and wrong formats', () => {
  for (const value of ['resume/../../secret.pdf', 'resume/%2e%2e/secret.pdf', '//evil.example/resume.pdf', 'https://example.com/resume/a.pdf', 'resume/a.html', 'resume/a.pdf?download=1', 'resume/a.pdf#fragment', 'resume\\a.pdf']) {
    assert.equal(resumeUrl(value, '/portfolio/', 'pdf'), undefined, value);
  }
});
