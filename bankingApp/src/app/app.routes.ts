import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Accounts } from './features/accounts/accounts';
import { Transactions } from './features/transactions/transactions';
import { Profile } from './features/profile/profile';
import { authGuard } from './core/guards/auth-guard';
import { Cards } from './features/cards/cards';

export const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'login', loadComponent: () => import('./features/auth/login/login').then(c => c.Login) },
    { path: 'register', loadComponent: () => import('./features/auth/register/register').then(c => c.Register) },
    { path: 'accounts', component: Accounts, canActivate: [authGuard] },
    { path: 'transactions', component: Transactions, canActivate: [authGuard] },
    { path: 'cards', component: Cards, canActivate: [authGuard] },
    { path: 'profile', component: Profile, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
