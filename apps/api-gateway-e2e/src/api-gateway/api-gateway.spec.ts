import axios from 'axios';
import { describe, it, expect } from 'vitest';

describe('GET /gateway-health', () => {
  it('should return a message', async () => {
    const res = await axios.get('/gateway-health');
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('message');
  });
});
