import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getModelToken } from '@nestjs/mongoose';
import { Project } from '../infrastructure/schemas/project.schema';
import { TasksService } from '../../tasks/application/tasks.service';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let tasksService: TasksService;

  const mockTasksService = {
    removeByProjectId: jest.fn(),
  };

  class MockProjectModel {
    save: any;
    constructor(public data: any) {
      this.save = jest.fn().mockResolvedValue({ _id: '1', ...this.data });
    }

    static find = jest.fn();
    static findOne = jest.fn();
    static findOneAndUpdate = jest.fn();
    static deleteOne = jest.fn();
    static db = {
      startSession: jest.fn().mockResolvedValue({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      }),
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: MockProjectModel,
        },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    tasksService = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project', async () => {
      const createDto = { name: 'New Project', color: '#000' };
      const result = await service.create('user1', createDto);
      expect(result).toHaveProperty('_id', '1');
      expect(result).toHaveProperty('name', 'New Project');
    });
  });

  describe('findAll', () => {
    it('should return array of projects', async () => {
      const mockProject = { _id: '1', name: 'Project 1' };
      MockProjectModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockProject]),
      });
      const result = await service.findAll('user1');
      expect(result).toEqual([mockProject]);
      expect(MockProjectModel.find).toHaveBeenCalledWith({ userId: 'user1' });
    });
  });

  describe('remove', () => {
    it('should delete project and cascade tasks', async () => {
      MockProjectModel.deleteOne.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      await service.remove('user1', '1');
      expect(MockProjectModel.deleteOne).toHaveBeenCalled();
      expect(tasksService.removeByProjectId).toHaveBeenCalledWith('user1', '1');
    });

    it('should throw NotFoundException if not found', async () => {
       MockProjectModel.deleteOne.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });
      await expect(service.remove('user1', '1')).rejects.toThrow(NotFoundException);
    });
  });
});

