import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent) },
    { path: 'summary', loadComponent: () => import('./summary/summary.component').then(c => c.SummaryComponent) },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
