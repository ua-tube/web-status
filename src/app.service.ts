import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpHealthIndicator } from '@nestjs/terminus';
import { serviceEnvNames } from './constants';
import { Cron, CronExpression } from '@nestjs/schedule';

enum Status {
  Online = 'Online',
  Offline = 'Offline',
}

type ServiceStatus = {
  name: string;
  class: string;
  status: string;
};

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private services: ServiceStatus[];

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpHealthIndicator,
  ) {}

  async index() {
    if (!this.services || !this.services.length) {
      await this.cron();
    }

    return { services: this.services };
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async cron() {
    this.logger.log('Updating system service statuses...');
    const promises = [];
    for (const name of serviceEnvNames) {
      promises.push(
        new Promise(async (resolve: (serviceStatus: ServiceStatus) => void) => {
          const key = name.split('_ORIGIN', 1)[0];
          const url = this.getUrl(name);

          let status: Status = Status.Offline;
          try {
            const isUp = await this.http.responseCheck(
              key,
              url,
              (response) => {
                return response.data === 'pong';
              },
              { timeout: 1000 },
            );
            status = isUp ? Status.Online : Status.Offline;
          } catch {}

          resolve({ name: key, class: status.toLowerCase(), status });
        }),
      );
    }

    const services = await Promise.all(promises);

    this.services = services.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  }

  private getUrl(serviceName: string) {
    return this.configService.getOrThrow<string>(serviceName);
  }
}
