import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Task,
  TaskDocument,
  TaskStatus,
  TaskPriority,
} from '../infrastructure/schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { ProjectsService } from '../../projects/application/projects.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @Inject(forwardRef(() => ProjectsService))
    private projectsService: ProjectsService,
  ) {}

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    // Validate Project Ownership if projectId is present
    if (createTaskDto.projectId) {
      await this.projectsService.findOne(userId, createTaskDto.projectId);
    }

    const newTask = new this.taskModel({
      ...createTaskDto,
      userId,
    });
    return newTask.save();
  }

  async findAll(
    userId: string,
    filters: {
      projectId?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
    },
  ): Promise<Task[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const query: any = { userId };
    if (filters.projectId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.projectId = filters.projectId;
    }
    if (filters.status) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.status = filters.status;
    }
    if (filters.priority) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.priority = filters.priority;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.taskModel.find(query).populate('labels').exec();
  }

  async findOne(userId: string, taskId: string): Promise<Task> {
    const task = await this.taskModel
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .findOne({ _id: taskId, userId: userId } as any)
      .populate('labels')
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found or access denied');
    }
    return task;
  }

  async update(
    userId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    // Validate Project Ownership if projectId is being updated
    if (updateTaskDto.projectId) {
      await this.projectsService.findOne(userId, updateTaskDto.projectId);
    }

    const task = await this.taskModel
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .findOneAndUpdate({ _id: taskId, userId: userId } as any, updateTaskDto, {
        new: true,
      })
      .populate('labels')
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found or access denied');
    }
    return task;
  }

  async remove(userId: string, taskId: string): Promise<void> {
    const result = await this.taskModel
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .deleteOne({ _id: taskId, userId: userId } as any)
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found or access denied');
    }
  }

  async removeByProjectId(userId: string, projectId: string): Promise<void> {
    await this.taskModel
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .deleteMany({ projectId: projectId, userId: userId } as any)
      .exec();
  }
}
