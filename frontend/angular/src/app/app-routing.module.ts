import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductDetailComponent } from './components/products/product-detail/product-detail.component';
import { ProductFormComponent } from './components/products/product-form/product-form.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { UsersComponent } from './components/users/users.component';
import { ProfileComponent } from './components/profile/profile.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'products', 
    component: ProductsComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'products/new', 
    component: ProductFormComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'products/:id', 
    component: ProductDetailComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'products/:id/edit', 
    component: ProductFormComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'categories', 
    component: CategoriesComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'users', 
    component: UsersComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard] 
  },
  
  // Default redirects
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
