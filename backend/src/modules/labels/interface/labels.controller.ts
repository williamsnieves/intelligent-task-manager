import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LabelsService } from '../application/labels.service';
import { CreateLabelDto, UpdateLabelDto } from '../dto/label.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  create(@Request() req, @Body() createLabelDto: CreateLabelDto) {
    return this.labelsService.create(req.user.userId, createLabelDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.labelsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.labelsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateLabelDto: UpdateLabelDto,
  ) {
    return this.labelsService.update(req.user.userId, id, updateLabelDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.labelsService.remove(req.user.userId, id);
  }
}

