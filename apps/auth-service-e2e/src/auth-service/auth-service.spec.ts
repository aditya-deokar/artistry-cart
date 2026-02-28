import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('GET /', () => {
  it('should return a message', async () => {
    const res = await axios.get('/');
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('message');
  });
});
