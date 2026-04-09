import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // disponível em todos os módulos sem re-importar
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
