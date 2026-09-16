import { HttpException, type ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { PublicChatRateLimitGuard } from './public-chat-rate-limit.guard.js';

function createContext(
  ip: string,
  publicId: string,
  forwardedFor: string,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        ip,
        params: { publicId },
        headers: { 'x-forwarded-for': forwardedFor },
        socket: { remoteAddress: '127.0.0.1' },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('PublicChatRateLimitGuard', () => {
  it('enforces the per-IP public request limit without using public IDs or headers', () => {
    const guard = new PublicChatRateLimitGuard();
    const ip = '203.0.113.25';

    for (let requestCount = 0; requestCount < 30; requestCount += 1) {
      expect(
        guard.canActivate(
          createContext(
            ip,
            `public-agent-${requestCount}`,
            `198.51.100.${requestCount}`,
          ),
        ),
      ).toBe(true);
    }

    try {
      guard.canActivate(
        createContext(ip, 'another-public-agent', '203.0.113.99'),
      );
      throw new Error('Expected the rate limiter to reject request 31');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(429);
    }
  });
});
