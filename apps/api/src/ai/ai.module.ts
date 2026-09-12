import { Module } from '@nestjs/common';
import { AI_PROVIDER } from './providers/ai-provider.interface.js';
import { OpenAiProvider } from './providers/openai.provider.js';

@Module({
  providers: [
    OpenAiProvider,
    {
      provide: AI_PROVIDER,
      useExisting: OpenAiProvider,
    },
  ],
  exports: [AI_PROVIDER],
})
export class AiModule {}
