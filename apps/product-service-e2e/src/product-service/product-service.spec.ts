import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('GET / (health)', () => {
  it('should return a health response', async () => {
    const res = await axios.get('/');

    expect(res.status).toBe(200);
  });
});
