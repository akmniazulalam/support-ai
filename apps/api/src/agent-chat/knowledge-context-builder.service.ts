import { Injectable } from '@nestjs/common';
import type {
  KnowledgeSource,
  KnowledgeSourceType,
} from '../generated/prisma/client.js';

const MAX_CONTEXT_LENGTH = 24_000;
const MAX_SOURCE_CONTENT_LENGTH = 6_000;

type KnowledgeContextSource = Pick<
  KnowledgeSource,
  'type' | 'title' | 'content' | 'sourceUrl'
>;

@Injectable()
export class KnowledgeContextBuilderService {
  build(sources: KnowledgeContextSource[]): string {
    let context = '';

    for (const source of sources) {
      if (context.length >= MAX_CONTEXT_LENGTH) {
        break;
      }

      const entry = this.formatSource(source);
      const separator = context.length === 0 ? '' : '\n\n';
      const availableLength =
        MAX_CONTEXT_LENGTH - context.length - separator.length;

      context += `${separator}${entry.slice(0, Math.max(availableLength, 0))}`;
    }

    return context || 'No knowledge sources are available for this agent.';
  }

  private formatSource(source: KnowledgeContextSource): string {
    const sections = [
      `Title: ${source.title}`,
      `Type: ${this.formatType(source.type)}`,
    ];

    if (source.content !== null && source.content.length > 0) {
      sections.push(
        `Content:\n${source.content.slice(0, MAX_SOURCE_CONTENT_LENGTH)}`,
      );
    }

    if (source.sourceUrl !== null && source.sourceUrl.length > 0) {
      sections.push(`Reference URL: ${source.sourceUrl}`);
    }

    return sections.join('\n');
  }

  private formatType(type: KnowledgeSourceType): string {
    return type.toLowerCase();
  }
}
