/** Portfolio data is text, never executable HTML. Reject unknown navigation schemes. */
export function externalUrl(value: string): string | undefined {
  if (!value || value !== value.trim() || /[\u0000-\u0020\u007f]/.test(value)) return;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && url.hostname && !url.username && !url.password) return url.href;
    // Email links support one address, with no injected headers or message fields.
    if (url.protocol === 'mailto:' && /^mailto:[A-Za-z0-9.!#$&'*+/=_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) return value;
  } catch { /* Invalid configuration renders as unavailable, never as a link. */ }
}

/** Only same-site files below public/resume are eligible for resume links. */
export function resumeUrl(value: string, base: string, extension: 'pdf' | 'docx'): string | undefined {
  const relative = value.replace(/^\//, '');
  if (!new RegExp(`^resume/[A-Za-z0-9_-][A-Za-z0-9_.-]*\\.${extension}$`, 'i').test(relative)) return;
  return `${base.endsWith('/') ? base : `${base}/`}${relative}`;
}
