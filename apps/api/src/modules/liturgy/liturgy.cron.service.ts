import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LiturgyService } from './liturgy.service';

@Injectable()
export class LiturgyCronService {
  private readonly logger = new Logger(LiturgyCronService.name);

  constructor(private liturgy: LiturgyService) {}

  // Executa todos os dias às 00:01 para pré-carregar o conteúdo do dia
  @Cron('1 0 * * *')
  async fetchDailyContent() {
    this.logger.log('⏰ CRON: Buscando conteúdo litúrgico do dia...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.liturgy.fetchAndSave(today);
    this.logger.log('✅ CRON: Conteúdo litúrgico salvo com sucesso');
  }
}
