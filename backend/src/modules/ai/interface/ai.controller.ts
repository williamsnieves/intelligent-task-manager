import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AiService } from '../application/ai.service';
import { AnalyzeTaskDto } from '../dto/analyze-task.dto';
import { AiAnalysisResponseDto } from '../dto/ai-analysis-response.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  async analyzeTask(
    @Body() analyzeTaskDto: AnalyzeTaskDto,
  ): Promise<AiAnalysisResponseDto> {
    const result = await this.aiService.analyzeTask(
      analyzeTaskDto.description,
      analyzeTaskDto.currentTitle,
    );
    
    return {
      priority: result.priority,
      dueDate: result.dueDate,
      reasoning: result.reasoning,
      titleSuggestions: result.titleSuggestions,
      descriptionSuggestions: result.descriptionSuggestions,
    };
  }

  @Get('health')
  async checkHealth(): Promise<{ available: boolean; provider: string }> {
    return this.aiService.checkHealth();
  }
}

