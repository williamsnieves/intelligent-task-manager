import apiClient from '../../../lib/axios';
import type { AiAnalysisRequest, AiAnalysisResponse, AiHealthResponse } from '../types/ai.types';

export const aiService = {
  analyzeTask: async (description: string, currentTitle?: string): Promise<AiAnalysisResponse> => {
    const response = await apiClient.post<AiAnalysisResponse>('/ai/analyze', {
      description,
      currentTitle,
    } as AiAnalysisRequest);
    return response.data;
  },

  checkHealth: async (): Promise<AiHealthResponse> => {
    const response = await apiClient.get<AiHealthResponse>('/ai/health');
    return response.data;
  },
};

