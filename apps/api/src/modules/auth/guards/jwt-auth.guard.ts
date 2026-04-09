import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Use este guard em qualquer rota protegida:
// @UseGuards(JwtAuthGuard)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
