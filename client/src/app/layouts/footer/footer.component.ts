import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="mm-footer">
      <div class="container">
        <div class="mm-footer__grid">
          <div class="mm-footer__brand">
            <h3 class="mm-footer__logo">MoneyMarket</h3>
            <p>Connecting borrowers and lenders for a better financial future.</p>
          </div>

          <div class="mm-footer__links">
            <h4>Company</h4>
            <ul>
              <li><a routerLink="/about">About Us</a></li>
              <li><a routerLink="/how-it-works">How it Works</a></li>
              <li><a routerLink="/contact">Contact</a></li>
              <li><a routerLink="/careers">Careers</a></li>
            </ul>
          </div>

          <div class="mm-footer__links">
            <h4>Products</h4>
            <ul>
              <li><a routerLink="/borrow">Personal Loans</a></li>
              <li><a routerLink="/invest">Invest</a></li>
              <li><a routerLink="/rates">Rates</a></li>
            </ul>
          </div>

          <div class="mm-footer__links">
            <h4>Legal</h4>
            <ul>
              <li><a routerLink="/privacy">Privacy Policy</a></li>
              <li><a routerLink="/terms">Terms of Service</a></li>
              <li><a routerLink="/cookies">Cookie Policy</a></li>
            </ul>
          </div>

          <div class="mm-footer__links">
            <h4>Support</h4>
            <ul>
              <li><a routerLink="/help">Help Center</a></li>
              <li><a routerLink="/faq">FAQ</a></li>
              <li><a href="mailto:support&#64;moneymarket.com">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div class="mm-footer__bottom">
          <p>&copy; {{ currentYear }} MoneyMarket. All rights reserved.</p>
          <p class="mm-footer__disclaimer">
            MoneyMarket is a peer-to-peer lending platform. Your capital is at risk.
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .mm-footer {
      background: var(--mm-primary);
      color: var(--mm-white);
      padding: var(--mm-spacing-xxl) 0 var(--mm-spacing-lg);
      margin-top: auto;

      &__grid {
        display: grid;
        grid-template-columns: 2fr repeat(4, 1fr);
        gap: var(--mm-spacing-xl);
        margin-bottom: var(--mm-spacing-xl);
      }

      &__brand {
        p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          margin-top: var(--mm-spacing-md);
        }
      }

      &__logo {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: var(--mm-white);
      }

      &__links {
        h4 {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 var(--mm-spacing-md);
          color: rgba(255, 255, 255, 0.9);
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          margin-bottom: var(--mm-spacing-sm);
        }

        a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color var(--mm-transition-fast);

          &:hover {
            color: var(--mm-white);
          }
        }
      }

      &__bottom {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: var(--mm-spacing-lg);
        text-align: center;

        p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }
      }

      &__disclaimer {
        margin-top: var(--mm-spacing-sm) !important;
        font-size: 0.75rem !important;
      }
    }

    @media (max-width: 768px) {
      .mm-footer {
        &__grid {
          grid-template-columns: 1fr 1fr;
        }

        &__brand {
          grid-column: 1 / -1;
        }
      }
    }

    @media (max-width: 480px) {
      .mm-footer {
        &__grid {
          grid-template-columns: 1fr;
        }
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
