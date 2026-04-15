import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { QuantityDashboardComponent } from './features/quantity/quantity-dashboard/quantity-dashboard';
import { QuantityHistoryComponent } from './features/quantity/quantity-history/quantity-history';
import { ProfileComponent } from './features/user/profile/profile';
import { authGuard, redirectLoggedInGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [redirectLoggedInGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [redirectLoggedInGuard] },
  { path: 'dashboard', component: QuantityDashboardComponent, canActivate: [authGuard] },
  { path: 'history', component: QuantityHistoryComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];