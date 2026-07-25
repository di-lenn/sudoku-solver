import { Controller, Get } from '@nestjs/common';
import packageJson from '../../package.json';

@Controller('version')
export class VersionController {
  @Get()
  getVersion() {
    return { version: packageJson.version };
  }
}
