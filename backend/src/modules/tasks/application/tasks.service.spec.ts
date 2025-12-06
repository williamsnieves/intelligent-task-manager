import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Task, TaskStatus, TaskPriority } from '../infrastructure/schemas/task.schema';
import { ProjectsService } from '../../projects/application/projects.service';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let projectsService: ProjectsService;

  const mockProjectsService = {
    findOne: jest.fn(),
  };

  class MockTaskModel {
    save: any;
    constructor(public data: any) {
      this.save = jest.fn().mockResolvedValue({ _id: '1', ...this.data });
    }

    static find = jest.fn();
    static findOne = jest.fn();
    static findOneAndUpdate = jest.fn();
    static deleteOne = jest.fn();
    static deleteMany = jest.fn();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: MockTaskModel,
        },
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task without project', async () => {
      const dto = { title: 'Test Task', status: TaskStatus.TODO };
      const result = await service.create('user1', dto as any);
      expect(result).toHaveProperty('title', 'Test Task');
    });

    it('should validate project ownership if projectId provided', async () => {
      const dto = { title: 'Test Task', projectId: 'p1', status: TaskStatus.TODO };
      mockProjectsService.findOne.mockResolvedValue({ _id: 'p1' });
      
      await service.create('user1', dto as any);
      expect(projectsService.findOne).toHaveBeenCalledWith('user1', 'p1');
    });
  });
  
  describe('findAll', () => {
      it('should apply filters', async () => {
          const mockTask = { _id: '1' };
          MockTaskModel.find.mockReturnValue({
              populate: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([mockTask])
          });

          await service.findAll('user1', { status: TaskStatus.IN_PROGRESS });
          expect(MockTaskModel.find).toHaveBeenCalledWith(expect.objectContaining({ 
              userId: 'user1',
              status: TaskStatus.IN_PROGRESS 
          }));
      });
  });
});

