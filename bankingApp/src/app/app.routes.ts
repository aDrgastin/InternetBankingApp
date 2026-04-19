import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Accounts } from './features/accounts/accounts';

export const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'accounts', component: Accounts },
    { path: 'login', loadComponent: () => import('./features/auth/login/login').then(c => c.Login) },
    { path: 'register', loadComponent: () => import('./features/auth/register/register').then(c => c.Register) }
];
