import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class AnalyzeTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'Task description is too long' })
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Task title is too long' })
  currentTitle?: string;
}
