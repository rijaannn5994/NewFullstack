import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:5000/api';

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with unauthenticated state', (done) => {
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(false);
      done();
    });
  });

  it('should check existing session on init', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('userRole', 'Admin');
    localStorage.setItem('username', 'testuser');

    const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any);

    newService.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBe(true);
    });
  });

  it('should login successfully', (done) => {
    const mockResponse = {
      token: 'test-token',
      role: 'Admin' as const,
      username: 'admin'
    };

    service.login('admin', 'admin').subscribe(() => {
      expect(localStorage.getItem('authToken')).toBe('test-token');
      expect(localStorage.getItem('userRole')).toBe('Admin');
      expect(localStorage.getItem('username')).toBe('admin');

      service.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBe(true);
      });

      service.userRole$.subscribe(role => {
        expect(role).toBe('Admin');
      });

      service.username$.subscribe(username => {
        expect(username).toBe('admin');
        done();
      });
    });

    const req = httpMock.expectOne(`${apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'admin' });
    req.flush(mockResponse);
  });

  it('should fallback to mock admin login when API fails', (done) => {
    service.login('admin', 'admin').subscribe(() => {
      expect(localStorage.getItem('authToken')).toBe('mock-admin-token');
      expect(localStorage.getItem('userRole')).toBe('Admin');
      expect(localStorage.getItem('username')).toBe('admin');

      service.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBe(true);
        done();
      });
    });

    const req = httpMock.expectOne(`${apiUrl}/auth/login`);
    req.error(new ProgressEvent('Network error'));
  });

  it('should fallback to mock staff login when API fails', (done) => {
    service.login('staff', 'staff').subscribe(() => {
      expect(localStorage.getItem('authToken')).toBe('mock-staff-token');
      expect(localStorage.getItem('userRole')).toBe('Staff');
      expect(localStorage.getItem('username')).toBe('staff');

      service.userRole$.subscribe(role => {
        expect(role).toBe('staff');
        done();
      });
    });

    const req = httpMock.expectOne(`${apiUrl}/auth/login`);
    req.error(new ProgressEvent('Network error'));
  });

  it('should throw error for invalid mock credentials', (done) => {
    service.login('invalid', 'invalid').subscribe({
      next: () => fail('Should have thrown error'),
      error: (error) => {
        expect(error).toBeTruthy();
        done();
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/auth/login`);
    req.error(new ProgressEvent('Network error'));
  });

  it('should logout successfully', (done) => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('userRole', 'Admin');
    localStorage.setItem('username', 'admin');

    service.logout().subscribe(() => {
      expect(localStorage.getItem('authToken')).toBe(null);
      expect(localStorage.getItem('userRole')).toBe(null);
      expect(localStorage.getItem('username')).toBe(null);

      service.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBe(false);
      });

      service.userRole$.subscribe(role => {
        expect(role).toBe(null);
        done();
      });
    });

    const req = httpMock.expectOne(`${apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should clear session even if logout API fails', (done) => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('userRole', 'Admin');

    service.logout().subscribe(() => {
      expect(localStorage.getItem('authToken')).toBe(null);
      expect(localStorage.getItem('userRole')).toBe(null);
      done();
    });

    const req = httpMock.expectOne(`${apiUrl}/auth/logout`);
    req.error(new ProgressEvent('Network error'));
  });

  it('should get token', () => {
    localStorage.setItem('authToken', 'test-token');
    expect(service.getToken()).toBe('test-token');
  });

  it('should get role', () => {
    localStorage.setItem('userRole', 'Admin');
    expect(service.getRole()).toBe('Admin');
  });

  it('should check if user is admin', () => {
    localStorage.setItem('userRole', 'Admin');
    expect(service.isAdmin()).toBe(true);

    localStorage.setItem('userRole', 'Staff');
    expect(service.isAdmin()).toBe(false);
  });
});
