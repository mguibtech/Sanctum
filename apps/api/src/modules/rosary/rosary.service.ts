import { Injectable } from '@nestjs/common';
import { ChallengeType } from '@prisma/client';
import { ChallengeService } from '../challenges/challenge.service';
import { SessionsService } from '../sessions/sessions.service';
import { StreakService } from '../streak/streak.service';
import { XpService } from '../xp/xp.service';

const MYSTERIES: Record<string, { name: string; mysteries: string[] }> = {
  '0': {
    name: 'Misterios Gloriosos',
    mysteries: [
      'A Ressurreicao de Jesus',
      'A Ascensao de Jesus ao Ceu',
      'A vinda do Espirito Santo',
      'A Assuncao de Maria ao Ceu',
      'A Coroacao de Maria no Ceu',
    ],
  },
  '1': {
    name: 'Misterios Gozosos',
    mysteries: [
      'A Anunciacao do Anjo a Maria',
      'A Visitacao de Maria a Isabel',
      'O Nascimento de Jesus',
      'A Apresentacao de Jesus no Templo',
      'A perda e o encontro de Jesus no Templo',
    ],
  },
  '2': {
    name: 'Misterios Dolorosos',
    mysteries: [
      'A Agonia de Jesus no Horto',
      'A Flagelacao de Jesus',
      'A Coroacao de Espinhos',
      'Jesus carrega a Cruz',
      'A Crucificacao de Jesus',
    ],
  },
  '3': {
    name: 'Misterios Gloriosos',
    mysteries: [
      'A Ressurreicao de Jesus',
      'A Ascensao de Jesus ao Ceu',
      'A vinda do Espirito Santo',
      'A Assuncao de Maria ao Ceu',
      'A Coroacao de Maria no Ceu',
    ],
  },
  '4': {
    name: 'Misterios Luminosos',
    mysteries: [
      'O Batismo de Jesus no Jordao',
      'O milagre de Cana',
      'O anuncio do Reino de Deus',
      'A Transfiguracao',
      'A instituicao da Eucaristia',
    ],
  },
  '5': {
    name: 'Misterios Dolorosos',
    mysteries: [
      'A Agonia de Jesus no Horto',
      'A Flagelacao de Jesus',
      'A Coroacao de Espinhos',
      'Jesus carrega a Cruz',
      'A Crucificacao de Jesus',
    ],
  },
  '6': {
    name: 'Misterios Gozosos',
    mysteries: [
      'A Anunciacao do Anjo a Maria',
      'A Visitacao de Maria a Isabel',
      'O Nascimento de Jesus',
      'A Apresentacao de Jesus no Templo',
      'A perda e o encontro de Jesus no Templo',
    ],
  },
};

@Injectable()
export class RosaryService {
  constructor(
    private streak: StreakService,
    private xp: XpService,
    private challenges: ChallengeService,
    private sessions: SessionsService,
  ) {}

  getToday() {
    const dayOfWeek = new Date().getDay().toString();
    return MYSTERIES[dayOfWeek];
  }

  async complete(userId: string) {
    const [updatedStreak, xpResult] = await Promise.all([
      this.streak.checkIn(userId),
      this.xp.recordRosary(userId),
    ]);

    this.challenges.incrementProgress(userId, ChallengeType.ROSARY).catch(() => {});
    await this.sessions.logCompletedSession(userId, 'ROSARY', null, {
      durationSeconds: 20 * 60,
      contemplated: true,
      xpGranted: xpResult?.xpGained ?? 0,
      streakCounted: true,
    });

    return {
      message: 'Terço concluido! Que Nossa Senhora interceda por voce.',
      streak: updatedStreak,
      xp: xpResult,
    };
  }
}
