import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      isAuthenticated$: of(false),
      username$: of(null),
      userRole$: of(null)
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isAuthenticated).toBe(false);
    expect(component.username).toBe(null);
    expect(component.userRole).toBe(null);
    expect(component.showAboutModal).toBe(false);
    expect(component.showContactForm).toBe(false);
    expect(component.contactSubmitted).toBe(false);
  });

  it('should navigate to inventory when authenticated user clicks Get Started', () => {
    component.isAuthenticated = true;
    component.onGetStarted();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inventory']);
  });

  it('should navigate to login when unauthenticated user clicks Get Started', () => {
    component.isAuthenticated = false;
    component.onGetStarted();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to inventory when onDashboard is called', () => {
    component.onDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inventory']);
  });

  it('should logout and navigate to home when onLogout is called', () => {
    mockAuthService.logout.and.returnValue(of(null));
    component.onLogout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should open about modal', () => {
    component.openAbout();
    expect(component.showAboutModal).toBe(true);
  });

  it('should close about modal', () => {
    component.showAboutModal = true;
    component.closeAbout();
    expect(component.showAboutModal).toBe(false);
  });

  it('should show contact form when scrollToContact is called', () => {
    component.scrollToContact();
    expect(component.showContactForm).toBe(true);
  });

  it('should submit contact form and reset after timeout', (done) => {
    component.contactForm = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      company: 'Test Co',
      subject: 'Test Subject',
      message: 'Test Message'
    };

    component.submitContact();
    expect(component.contactSubmitted).toBe(true);

    setTimeout(() => {
      expect(component.contactSubmitted).toBe(false);
      expect(component.contactForm.name).toBe('');
      expect(component.contactForm.email).toBe('');
      done();
    }, 3100);
  });
});
