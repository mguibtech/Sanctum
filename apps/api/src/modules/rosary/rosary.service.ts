import { Injectable } from '@nestjs/common';
import { StreakService } from '../streak/streak.service';

// Mistérios do Terço por dia da semana
const MYSTERIES: Record<string, { name: string; mysteries: string[] }> = {
  // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  '0': {
    name: 'Mistérios Gloriosos',
    mysteries: [
      'A Ressurreição de Jesus',
      'A Ascensão de Jesus ao Céu',
      'A vinda do Espírito Santo',
      'A Assunção de Maria ao Céu',
      'A Coroação de Maria no Céu',
    ],
  },
  '1': {
    name: 'Mistérios Gozosos',
    mysteries: [
      'A Anunciação do Anjo a Maria',
      'A Visitação de Maria a Isabel',
      'O Nascimento de Jesus',
      'A Apresentação de Jesus no Templo',
      'A perda e o encontro de Jesus no Templo',
    ],
  },
  '2': {
    name: 'Mistérios Dolorosos',
    mysteries: [
      'A Agonia de Jesus no Horto',
      'A Flagelação de Jesus',
      'A Coroação de Espinhos',
      'Jesus carrega a Cruz',
      'A Crucificação de Jesus',
    ],
  },
  '3': {
    name: 'Mistérios Gloriosos',
    mysteries: [
      'A Ressurreição de Jesus',
      'A Ascensão de Jesus ao Céu',
      'A vinda do Espírito Santo',
      'A Assunção de Maria ao Céu',
      'A Coroação de Maria no Céu',
    ],
  },
  '4': {
    name: 'Mistérios Luminosos',
    mysteries: [
      'O Batismo de Jesus no Jordão',
      'O milagre de Caná',
      'O anúncio do Reino de Deus',
      'A Transfiguração',
      'A instituição da Eucaristia',
    ],
  },
  '5': {
    name: 'Mistérios Dolorosos',
    mysteries: [
      'A Agonia de Jesus no Horto',
      'A Flagelação de Jesus',
      'A Coroação de Espinhos',
      'Jesus carrega a Cruz',
      'A Crucificação de Jesus',
    ],
  },
  '6': {
    name: 'Mistérios Gozosos',
    mysteries: [
      'A Anunciação do Anjo a Maria',
      'A Visitação de Maria a Isabel',
      'O Nascimento de Jesus',
      'A Apresentação de Jesus no Templo',
      'A perda e o encontro de Jesus no Templo',
    ],
  },
};

@Injectable()
export class RosaryService {
  constructor(private streak: StreakService) {}

  getToday() {
    const dayOfWeek = new Date().getDay().toString();
    return MYSTERIES[dayOfWeek];
  }

  async complete(userId: string) {
    // Completar o terço conta como atividade do dia
    const updatedStreak = await this.streak.checkIn(userId);
    return {
      message: '✝️ Terço concluído! Que Nossa Senhora interceda por você.',
      streak: updatedStreak,
    };
  }
}
