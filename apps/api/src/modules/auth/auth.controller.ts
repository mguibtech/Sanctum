import { Controller, Post, Body, UseGuards, Request, HttpCode, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { PreferenceService } from '../personalization/preference.service';
import { OnboardingDto } from '../personalization/dto/onboarding.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private preference: PreferenceService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  login(@Request() req: any) {
    return this.auth.login(req.user.id, req.user.email);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboarding')
  @HttpCode(200)
  completeOnboarding(@Request() req: any, @Body() dto: OnboardingDto) {
    return this.preference.completeOnboarding(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return this.auth.getUser(req.user.id);
  }
}
