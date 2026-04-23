import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      isAuthenticated$: of(true),
      username$: of('testuser'),
      userRole$: of('Admin')
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NavigationComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with auth state', () => {
    expect(component.isAuthenticated).toBe(true);
    expect(component.username).toBe('testuser');
    expect(component.userRole).toBe('Admin');
  });

  it('should navigate to home', () => {
    component.navigateHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should navigate to inventory', () => {
    component.navigateInventory();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inventory']);
  });

  it('should navigate to suppliers', () => {
    component.navigateSuppliers();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/supplier']);
  });

  it('should logout and emit logout event', () => {
    mockAuthService.logout.and.returnValue(of(null));
    spyOn(component.logout, 'emit');

    component.onLogout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(component.logout.emit).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should check if page is active', () => {
    component.currentPage = 'inventory';
    expect(component.isActive('inventory')).toBe(true);
    expect(component.isActive('home')).toBe(false);
  });

  it('should handle currentPage input', () => {
    component.currentPage = 'supplier';
    expect(component.isActive('supplier')).toBe(true);
  });

  it('should update username when auth service changes', (done) => {
    const newUsername = 'newuser';
    (mockAuthService as any).username$ = of(newUsername);

    component.ngOnInit();

    setTimeout(() => {
      expect(component.username).toBe(newUsername);
      done();
    }, 100);
  });

  it('should update userRole when auth service changes', (done) => {
    const newRole = 'Staff';
    (mockAuthService as any).userRole$ = of(newRole);

    component.ngOnInit();

    setTimeout(() => {
      expect(component.userRole).toBe(newRole);
      done();
    }, 100);
  });

  it('should update isAuthenticated when auth service changes', (done) => {
    (mockAuthService as any).isAuthenticated$ = of(false);

    component.ngOnInit();

    setTimeout(() => {
      expect(component.isAuthenticated).toBe(false);
      done();
    }, 100);
  });
});
