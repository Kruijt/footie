import { ApplicationConfig } from '@angular/core';

import { fireProviders } from './core/modules/fire.module';
import { coreProviders } from './core/modules/core.module';

export const appConfig: ApplicationConfig = {
  providers: [...coreProviders, ...fireProviders],
};
