import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './infrastructure/schemas/project.schema';
import { ProjectsService } from './application/projects.service';
import { ProjectsController } from './interface/projects.controller';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    forwardRef(() => TasksModule), // Circular dependency for cascade delete (Project -> deletes Tasks)
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
