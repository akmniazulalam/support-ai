import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_TRACKERS = 10_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class PublicChatRateLimitGuard implements CanActivate {
  private readonly entries = new Map<string, RateLimitEntry>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const tracker = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const current = this.entries.get(tracker);

    if (current === undefined || current.resetAt <= now) {
      this.createEntry(tracker, now);
      return true;
    }

    if (current.count >= MAX_REQUESTS_PER_WINDOW) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
    return true;
  }

  private createEntry(tracker: string, now: number): void {
    if (this.entries.size >= MAX_TRACKERS) {
      this.removeExpiredEntries(now);
    }

    if (this.entries.size >= MAX_TRACKERS) {
      const oldestTracker = this.entries.keys().next().value as
        string | undefined;

      if (oldestTracker !== undefined) {
        this.entries.delete(oldestTracker);
      }
    }

    this.entries.set(tracker, { count: 1, resetAt: now + WINDOW_MS });
  }

  private removeExpiredEntries(now: number): void {
    for (const [tracker, entry] of this.entries) {
      if (entry.resetAt <= now) {
        this.entries.delete(tracker);
      }
    }
  }
}
