import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { appRoutes } from '../../routes/routes';

export const coreProviders = [
  provideExperimentalZonelessChangeDetection(),
  provideAnimationsAsync(),
  provideHttpClient(),
  provideRouter(appRoutes),
];
