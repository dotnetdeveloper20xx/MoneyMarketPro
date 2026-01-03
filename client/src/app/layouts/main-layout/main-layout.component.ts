import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="mm-layout">
      <app-header></app-header>
      <main class="mm-layout__main">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .mm-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;

      &__main {
        flex: 1;
      }
    }
  `]
})
export class MainLayoutComponent {}
