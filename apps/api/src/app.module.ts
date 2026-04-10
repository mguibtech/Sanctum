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
import { XpModule } from './modules/xp/xp.module';
import { ChallengeModule } from './modules/challenges/challenge.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { RoutinesModule } from './modules/routines/routines.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { ContentLibraryModule } from './modules/content-library/content-library.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { GroupsModule } from './modules/groups/groups.module';
import { PersonalizationModule } from './modules/personalization/personalization.module';

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
    XpModule,
    ChallengeModule,
    SessionsModule,
    RoutinesModule,
    RemindersModule,
    ContentLibraryModule,
    CampaignsModule,
    GroupsModule,
    PersonalizationModule,
  ],
})
export class AppModule {}
