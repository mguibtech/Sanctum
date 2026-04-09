import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LiturgyModule } from './modules/liturgy/liturgy.module';
import { BibleModule } from './modules/bible/bible.module';
import { StreakModule } from './modules/streak/streak.module';
import { RosaryModule } from './modules/rosary/rosary.module';
import { CommunityModule } from './modules/community/community.module';

@Module({
  imports: [
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({ isGlobal: true }),

    // CRON Jobs
    ScheduleModule.forRoot(),

    // Rate limiting (100 req / 60s por IP)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Banco de dados
    PrismaModule,

    // Módulos de negócio
    AuthModule,
    UsersModule,
    LiturgyModule,
    BibleModule,
    StreakModule,
    RosaryModule,
    CommunityModule,
  ],
})
export class AppModule {}
