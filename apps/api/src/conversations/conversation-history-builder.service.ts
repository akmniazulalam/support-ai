import { Injectable } from '@nestjs/common';
import type { Message, MessageRole } from '../generated/prisma/client.js';

const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_LENGTH = 12_000;

type ConversationHistoryMessage = Pick<Message, 'role' | 'content'>;

@Injectable()
export class ConversationHistoryBuilderService {
  build(messages: ConversationHistoryMessage[]): string {
    const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
    const entries: string[] = [];
    let remainingLength = MAX_HISTORY_LENGTH;

    for (let index = recentMessages.length - 1; index >= 0; index -= 1) {
      const message = recentMessages[index];
      const prefix = `${this.formatRole(message.role)}: `;
      const separatorLength = entries.length === 0 ? 0 : 1;
      const availableContentLength =
        remainingLength - prefix.length - separatorLength;

      if (availableContentLength <= 0) {
        break;
      }

      const entry = `${prefix}${message.content.slice(0, availableContentLength)}`;
      entries.unshift(entry);
      remainingLength -= entry.length + separatorLength;
    }

    return (
      entries.join('\n') || 'No previous conversation messages are available.'
    );
  }

  private formatRole(role: MessageRole): string {
    return role === 'USER' ? 'User' : 'Assistant';
  }
}
