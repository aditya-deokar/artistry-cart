import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('GET / (health)', () => {
  it('should return a welcome message', async () => {
    const res = await axios.get('/');

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Welcome to recommendation-service!' });
  });
});
