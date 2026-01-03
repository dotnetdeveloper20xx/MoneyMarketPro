import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <!-- Hero Section -->
    <section class="mm-hero">
      <div class="container">
        <div class="mm-hero__content">
          <h1 class="mm-hero__title">
            Smart lending for a<br>
            <span class="text-secondary">better future</span>
          </h1>
          <p class="mm-hero__subtitle">
            Connect directly with lenders or borrowers. Get competitive rates,
            transparent terms, and a seamless experience on our peer-to-peer platform.
          </p>
          <div class="mm-hero__actions">
            <a routerLink="/register" mat-raised-button class="mm-btn-primary mm-hero__btn">
              Get started
              <mat-icon>arrow_forward</mat-icon>
            </a>
            <a routerLink="/how-it-works" mat-button class="mm-btn-outline mm-hero__btn">
              Learn more
            </a>
          </div>
          <div class="mm-hero__stats">
            <div class="mm-hero__stat">
              <span class="mm-hero__stat-value">£50M+</span>
              <span class="mm-hero__stat-label">Loans funded</span>
            </div>
            <div class="mm-hero__stat">
              <span class="mm-hero__stat-value">15K+</span>
              <span class="mm-hero__stat-label">Happy customers</span>
            </div>
            <div class="mm-hero__stat">
              <span class="mm-hero__stat-value">4.8%</span>
              <span class="mm-hero__stat-label">Average rate</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="mm-features">
      <div class="container">
        <div class="mm-features__header">
          <h2>Why choose MoneyMarket?</h2>
          <p>We make borrowing and investing simple, transparent, and rewarding.</p>
        </div>
        <div class="mm-features__grid">
          <div class="mm-feature-card">
            <div class="mm-feature-card__icon mm-feature-card__icon--primary">
              <mat-icon>speed</mat-icon>
            </div>
            <h3>Quick approval</h3>
            <p>Get a decision in minutes, not days. Our streamlined process means faster access to funds.</p>
          </div>
          <div class="mm-feature-card">
            <div class="mm-feature-card__icon mm-feature-card__icon--success">
              <mat-icon>savings</mat-icon>
            </div>
            <h3>Competitive rates</h3>
            <p>Borrow from 4.8% APR or earn up to 8% returns as a lender. Better rates for everyone.</p>
          </div>
          <div class="mm-feature-card">
            <div class="mm-feature-card__icon mm-feature-card__icon--warning">
              <mat-icon>visibility</mat-icon>
            </div>
            <h3>Full transparency</h3>
            <p>No hidden fees. See exactly what you'll pay or earn before you commit.</p>
          </div>
          <div class="mm-feature-card">
            <div class="mm-feature-card__icon mm-feature-card__icon--primary">
              <mat-icon>security</mat-icon>
            </div>
            <h3>Secure platform</h3>
            <p>Bank-grade security protects your money and data. FCA regulated for your peace of mind.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="mm-how-it-works bg-light-blue">
      <div class="container">
        <div class="mm-how-it-works__header">
          <h2>How it works</h2>
          <p>Get started in three simple steps</p>
        </div>

        <div class="mm-how-it-works__tabs">
          <button
            [class.active]="activeTab === 'borrow'"
            (click)="activeTab = 'borrow'"
          >
            For Borrowers
          </button>
          <button
            [class.active]="activeTab === 'invest'"
            (click)="activeTab = 'invest'"
          >
            For Lenders
          </button>
        </div>

        <div class="mm-steps" *ngIf="activeTab === 'borrow'">
          <div class="mm-step">
            <div class="mm-step__number">1</div>
            <h4>Apply online</h4>
            <p>Complete our quick application form. It only takes a few minutes.</p>
          </div>
          <div class="mm-step__arrow">
            <mat-icon>arrow_forward</mat-icon>
          </div>
          <div class="mm-step">
            <div class="mm-step__number">2</div>
            <h4>Get approved</h4>
            <p>Receive a decision fast. We'll review your application and credit profile.</p>
          </div>
          <div class="mm-step__arrow">
            <mat-icon>arrow_forward</mat-icon>
          </div>
          <div class="mm-step">
            <div class="mm-step__number">3</div>
            <h4>Receive funds</h4>
            <p>Once funded by lenders, money is deposited directly to your account.</p>
          </div>
        </div>

        <div class="mm-steps" *ngIf="activeTab === 'invest'">
          <div class="mm-step">
            <div class="mm-step__number">1</div>
            <h4>Create account</h4>
            <p>Sign up and deposit funds to your MoneyMarket wallet.</p>
          </div>
          <div class="mm-step__arrow">
            <mat-icon>arrow_forward</mat-icon>
          </div>
          <div class="mm-step">
            <div class="mm-step__number">2</div>
            <h4>Browse loans</h4>
            <p>Explore the marketplace and choose loans that match your risk appetite.</p>
          </div>
          <div class="mm-step__arrow">
            <mat-icon>arrow_forward</mat-icon>
          </div>
          <div class="mm-step">
            <div class="mm-step__number">3</div>
            <h4>Earn returns</h4>
            <p>Receive monthly repayments including interest. Reinvest or withdraw anytime.</p>
          </div>
        </div>

        <div class="mm-how-it-works__cta">
          <a routerLink="/register" mat-raised-button class="mm-btn-primary">
            Get started today
          </a>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="mm-cta">
      <div class="container">
        <div class="mm-cta__content">
          <h2>Ready to take control of your finances?</h2>
          <p>Join thousands of borrowers and lenders on MoneyMarket</p>
          <div class="mm-cta__actions">
            <a routerLink="/register" mat-raised-button class="mm-btn-primary">
              Start borrowing
            </a>
            <a routerLink="/register" mat-raised-button class="mm-btn-secondary">
              Start investing
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .mm-hero {
      background: linear-gradient(135deg, var(--mm-primary) 0%, #001a4d 100%);
      color: var(--mm-white);
      padding: var(--mm-spacing-xxl) 0;
      min-height: 500px;
      display: flex;
      align-items: center;

      &__content {
        max-width: 700px;
      }

      &__title {
        font-size: 3.5rem;
        font-weight: 700;
        line-height: 1.1;
        margin: 0 0 var(--mm-spacing-lg);
        color: var(--mm-white);

        .text-secondary {
          color: #7CB9E8;
        }
      }

      &__subtitle {
        font-size: 1.25rem;
        opacity: 0.9;
        margin-bottom: var(--mm-spacing-xl);
        line-height: 1.6;
      }

      &__actions {
        display: flex;
        gap: var(--mm-spacing-md);
        margin-bottom: var(--mm-spacing-xxl);
      }

      &__btn {
        padding: 12px 32px !important;
        font-size: 1rem;

        mat-icon {
          margin-left: var(--mm-spacing-sm);
        }
      }

      &__stats {
        display: flex;
        gap: var(--mm-spacing-xl);
      }

      &__stat {
        display: flex;
        flex-direction: column;
      }

      &__stat-value {
        font-size: 2rem;
        font-weight: 700;
      }

      &__stat-label {
        font-size: 0.875rem;
        opacity: 0.7;
      }
    }

    .mm-features {
      padding: var(--mm-spacing-xxl) 0;
      background: var(--mm-white);

      &__header {
        text-align: center;
        margin-bottom: var(--mm-spacing-xl);

        h2 {
          font-size: 2.5rem;
          margin-bottom: var(--mm-spacing-sm);
        }

        p {
          font-size: 1.125rem;
          color: var(--mm-gray-600);
        }
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--mm-spacing-lg);
      }
    }

    .mm-feature-card {
      padding: var(--mm-spacing-lg);
      text-align: center;

      &__icon {
        width: 64px;
        height: 64px;
        border-radius: var(--mm-radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--mm-spacing-md);

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }

        &--primary {
          background: var(--mm-light-blue);
          color: var(--mm-primary);
        }

        &--success {
          background: #E8F5E9;
          color: var(--mm-success);
        }

        &--warning {
          background: #FFF3E0;
          color: var(--mm-warning);
        }
      }

      h3 {
        font-size: 1.25rem;
        margin-bottom: var(--mm-spacing-sm);
      }

      p {
        color: var(--mm-gray-600);
        margin: 0;
      }
    }

    .mm-how-it-works {
      padding: var(--mm-spacing-xxl) 0;

      &__header {
        text-align: center;
        margin-bottom: var(--mm-spacing-xl);

        h2 {
          font-size: 2.5rem;
          margin-bottom: var(--mm-spacing-sm);
        }

        p {
          font-size: 1.125rem;
          color: var(--mm-gray-600);
        }
      }

      &__tabs {
        display: flex;
        justify-content: center;
        gap: var(--mm-spacing-sm);
        margin-bottom: var(--mm-spacing-xl);

        button {
          padding: var(--mm-spacing-sm) var(--mm-spacing-lg);
          border: 2px solid var(--mm-primary);
          background: transparent;
          color: var(--mm-primary);
          font-size: 1rem;
          font-weight: 500;
          border-radius: var(--mm-radius-xl);
          cursor: pointer;
          transition: all var(--mm-transition-fast);

          &:hover,
          &.active {
            background: var(--mm-primary);
            color: var(--mm-white);
          }
        }
      }

      &__cta {
        text-align: center;
        margin-top: var(--mm-spacing-xl);
      }
    }

    .mm-steps {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: var(--mm-spacing-md);
    }

    .mm-step {
      text-align: center;
      max-width: 280px;

      &__number {
        width: 48px;
        height: 48px;
        border-radius: var(--mm-radius-full);
        background: var(--mm-primary);
        color: var(--mm-white);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 auto var(--mm-spacing-md);
      }

      h4 {
        font-size: 1.125rem;
        margin-bottom: var(--mm-spacing-sm);
      }

      p {
        color: var(--mm-gray-600);
        margin: 0;
        font-size: 0.875rem;
      }

      &__arrow {
        padding-top: 12px;
        color: var(--mm-gray-300);
      }
    }

    .mm-cta {
      background: var(--mm-primary);
      padding: var(--mm-spacing-xxl) 0;
      text-align: center;

      &__content {
        h2 {
          color: var(--mm-white);
          font-size: 2.5rem;
          margin-bottom: var(--mm-spacing-sm);
        }

        p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.125rem;
          margin-bottom: var(--mm-spacing-xl);
        }
      }

      &__actions {
        display: flex;
        justify-content: center;
        gap: var(--mm-spacing-md);
      }
    }

    @media (max-width: 768px) {
      .mm-hero {
        &__title {
          font-size: 2.5rem;
        }

        &__stats {
          flex-direction: column;
          gap: var(--mm-spacing-md);
        }
      }

      .mm-steps {
        flex-direction: column;
        align-items: center;
      }

      .mm-step__arrow {
        transform: rotate(90deg);
      }

      .mm-cta__actions {
        flex-direction: column;
      }
    }
  `]
})
export class LandingComponent {
  activeTab: 'borrow' | 'invest' = 'borrow';
}
