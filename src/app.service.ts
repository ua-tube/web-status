import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpHealthIndicator } from '@nestjs/terminus';
import { serviceEnvNames } from './constants';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpHealthIndicator,
  ) {}

  async index() {
    const promises = [];
    for (const name of serviceEnvNames) {
      promises.push(
        new Promise(async (resolve) => {
          const key = name.split('_ORIGIN', 1)[0];
          const url = this.getUrl(name);

          let status = 'Offline';
          try {
            const isUp = await this.http.responseCheck(
              key,
              url,
              (response) => {
                return response.data === 'pong';
              },
              { timeout: 1000 },
            );
            status = isUp ? 'Online' : 'Offline';
          } catch {}

          resolve({ name: key, class: status.toLowerCase(), status });
        }),
      );
    }

    const services = await Promise.all(promises);
    return {
      services: services.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      }),
    };
  }

  private getUrl(serviceName: string) {
    return this.configService.getOrThrow<string>(serviceName);
  }
}
