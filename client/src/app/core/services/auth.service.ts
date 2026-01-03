import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ChangePasswordRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Using signals for reactive state management
  private accessToken = signal<string | null>(null);
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);

  // Computed values
  readonly isAuthenticated = computed(() => !!this.accessToken());
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly userRoles = computed(() => this.currentUserSignal()?.roles ?? []);

  // Role checks
  readonly isBorrower = computed(() => this.userRoles().includes('Borrower'));
  readonly isLender = computed(() => this.userRoles().includes('Lender'));
  readonly isAdmin = computed(() => this.userRoles().includes('Admin'));
  readonly isCRM = computed(() => this.userRoles().includes('CRM'));
  readonly isSupport = computed(() => this.userRoles().includes('Support'));

  // For components that need observable
  private authState$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Check if there's a stored session
    const storedUser = sessionStorage.getItem('mm_user');
    const storedToken = sessionStorage.getItem('mm_token');

    if (storedUser && storedToken) {
      this.currentUserSignal.set(JSON.parse(storedUser));
      this.accessToken.set(storedToken);
      this.authState$.next(true);
    }
  }

  getToken(): string | null {
    return this.accessToken();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request, {
      withCredentials: true
    }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request, {
      withCredentials: true
    }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => this.clearAuth()
      });
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, request);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    const user: User = {
      userId: response.userId,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      roles: response.roles
    };

    this.accessToken.set(response.accessToken);
    this.currentUserSignal.set(user);
    this.isLoadingSignal.set(false);
    this.authState$.next(true);

    // Store in session storage (more secure than localStorage for tokens)
    sessionStorage.setItem('mm_user', JSON.stringify(user));
    sessionStorage.setItem('mm_token', response.accessToken);
  }

  private clearAuth(): void {
    this.accessToken.set(null);
    this.currentUserSignal.set(null);
    this.authState$.next(false);

    sessionStorage.removeItem('mm_user');
    sessionStorage.removeItem('mm_token');

    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  getAuthState$(): Observable<boolean> {
    return this.authState$.asObservable();
  }
}
