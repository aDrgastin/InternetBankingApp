import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Accounts } from './features/accounts/accounts';
import { Transactions } from './features/transactions/transactions';
import { Profile } from './features/profile/profile';
import { authGuard } from './core/guards/auth-guard';
import { Cards } from './features/cards/cards';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./features/welcome/welcome').then(c => c.Welcome) },
    { path: 'login', loadComponent: () => import('./features/auth/login/login').then(c => c.Login) },
    { path: 'register', loadComponent: () => import('./features/auth/register/register').then(c => c.Register) },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'accounts', component: Accounts, canActivate: [authGuard, roleGuard('USER')] },
    { path: 'transactions', component: Transactions, canActivate: [authGuard, roleGuard('USER')] },
    { path: 'cards', component: Cards, canActivate: [authGuard, roleGuard('USER')] },
    { path: 'profile', component: Profile, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
