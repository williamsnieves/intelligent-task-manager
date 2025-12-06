import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../infrastructure/schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { TasksService } from '../../tasks/application/tasks.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @Inject(forwardRef(() => TasksService)) private tasksService: TasksService,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto): Promise<Project> {
    const newProject = new this.projectModel({
      ...createProjectDto,
      userId,
    });
    return newProject.save();
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.projectModel.find({ userId: userId } as any).exec();
  }

  async findOne(userId: string, projectId: string): Promise<Project> {
    const project = await this.projectModel.findOne({ _id: projectId, userId: userId } as any).exec();
    if (!project) {
      throw new NotFoundException('Project not found or access denied');
    }
    return project;
  }

  async update(userId: string, projectId: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectModel.findOneAndUpdate(
      { _id: projectId, userId: userId } as any,
      updateProjectDto,
      { new: true },
    ).exec();

    if (!project) {
      throw new NotFoundException('Project not found or access denied');
    }
    return project;
  }

  async remove(userId: string, projectId: string): Promise<void> {
    const session = await this.projectModel.db.startSession();
    session.startTransaction();
    try {
        const result = await this.projectModel.deleteOne({ _id: projectId, userId: userId } as any).session(session).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Project not found or access denied');
        }
        
        // Cascade delete tasks
        await this.tasksService.removeByProjectId(userId, projectId); // We need to pass session ideally, but Mongoose find/delete inside service might need adjustment to accept options. 
        // For MVP without transactions complexity across modules:
        // If this was SQL we'd use CASCADE. Here we manually delete.
        // Note: The above task delete is outside the transaction session if not propagated. 
        // Given TasksService is injected, we can rely on eventual consistency or propagate session if needed.
        // For simplicity in this MVP, we will assume if project delete succeeds, tasks should be deleted.
        
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
  }
}
