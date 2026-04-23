import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login.component';
import { InventoryComponent } from './inventory/inventory';
import { SupplierComponent } from './supplier/supplier';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'supplier', component: SupplierComponent },
  { path: '**', redirectTo: '/home' }
];
