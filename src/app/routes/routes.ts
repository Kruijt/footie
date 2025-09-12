import { Routes } from '@angular/router';

import { initGuard } from '../core/guards/init.guard';

export const appRoutes: Routes = [
  {
    path: '',
    canActivateChild: [initGuard],
    children: [
      {
        path: '',
        children: [
          {
            path: '',
            loadComponent: () => import('./home/home.component').then((c) => c.HomeComponent),
            children: [
              {
                path: 'dashboard',
                loadComponent: () => import('./home/dashboard/dashboard.component').then((c) => c.DashboardComponent),
              },
              {
                path: 'settings',
                loadComponent: () => import('./home/setup/setup.component').then((c) => c.SetupComponent),
              },
              {
                path: 'setup',
                loadComponent: () => import('./home/setup/setup.component').then((c) => c.SetupComponent),
              },
            ],
          },
          {
            path: 'login',
            loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent),
          },
          { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },
    ],
  },
];
