import { InvalidCursorError } from './errors.js';
import type { DocumentPosition } from './store.js';

export function encodeCursor(position: DocumentPosition): string {
  const json = JSON.stringify({ c: position.createdAt.toISOString(), i: position.id });
  let binary = '';
  for (const byte of new TextEncoder().encode(json)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export function decodeCursor(cursor: string): DocumentPosition {
  let parsed: unknown;
  try {
    const binary = atob(cursor.replaceAll('-', '+').replaceAll('_', '/'));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new InvalidCursorError();
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new InvalidCursorError();
  }
  const { c, i } = parsed as { c?: unknown; i?: unknown };
  if (typeof c !== 'string' || typeof i !== 'string') {
    throw new InvalidCursorError();
  }
  const createdAt = new Date(c);
  if (Number.isNaN(createdAt.getTime())) {
    throw new InvalidCursorError();
  }
  return { createdAt, id: i };
}
