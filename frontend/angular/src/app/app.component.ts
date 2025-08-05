import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-navbar *ngIf="authService.isAuthenticated$ | async"></app-navbar>
      
      <main class="main-content" [class.with-navbar]="authService.isAuthenticated$ | async">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .main-content {
      flex: 1;
      background-color: #f8fafc;
    }
    
    .main-content.with-navbar {
      margin-top: 64px; /* Height of navbar */
    }
    
    @media (max-width: 768px) {
      .main-content.with-navbar {
        margin-top: 56px; /* Smaller navbar height on mobile */
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Universal CRUD Template - Angular';

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Initialize authentication state
    this.authService.initializeAuth();
  }
}
