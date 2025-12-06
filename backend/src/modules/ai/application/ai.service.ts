import { Injectable, Logger } from '@nestjs/common';
import { IAiProvider, IAiAnalysisResult } from '../domain/ai-provider.interface';
import { OllamaProvider } from '../infrastructure/ollama.provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: IAiProvider;

  constructor(private readonly ollamaProvider: OllamaProvider) {
    this.provider = this.ollamaProvider;
    this.logger.log('Using Ollama provider for local open-source LLMs');
  }

  async analyzeTask(description: string, currentTitle?: string): Promise<IAiAnalysisResult> {
    const isAvailable = await this.provider.isAvailable();
    
    if (!isAvailable) {
      this.logger.warn('Ollama is not available');
      throw new Error('Ollama is not running. Please start Ollama and ensure you have pulled a model (e.g., ollama pull mistral)');
    }

    return this.provider.analyzeTask(description, currentTitle);
  }

  async checkHealth(): Promise<{ available: boolean; provider: string }> {
    const available = await this.provider.isAvailable();
    
    return {
      available,
      provider: 'ollama',
    };
  }
}

