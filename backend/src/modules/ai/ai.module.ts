import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './interface/ai.controller';
import { AiService } from './application/ai.service';
import { OllamaProvider } from './infrastructure/ollama.provider';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, OllamaProvider],
  exports: [AiService],
})
export class AiModule {}

