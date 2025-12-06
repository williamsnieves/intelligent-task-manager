import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { LocalAuthGuard } from '../../../common/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
