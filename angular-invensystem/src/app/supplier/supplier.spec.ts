import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupplierComponent } from './supplier';
import { SupplierDataService } from '../supplier-data';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('SupplierComponent', () => {
  let component: SupplierComponent;
  let fixture: ComponentFixture<SupplierComponent>;
  let mockSupplierService: jasmine.SpyObj<SupplierDataService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockSuppliers = [
    {
      _id: '1',
      supplier_id: 'SUP-001',
      supplier_name: 'Test Supplier Ltd.',
      email: 'test@supplier.com',
      phone: '+44 7700 900000',
      reliability_score: 95,
      address: {
        street: '123 Test Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        country: 'UK'
      },
      performance_reviews: [
        {
          date: '2026-01-01T00:00:00Z',
          rating: 5,
          comment: 'Excellent service'
        },
        {
          date: '2026-02-01T00:00:00Z',
          rating: 4,
          comment: 'Good delivery time'
        }
      ]
    }
  ];

  beforeEach(async () => {
    mockSupplierService = jasmine.createSpyObj('SupplierDataService', [
      'getAll',
      'create',
      'update',
      'delete'
    ]);

    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: of(true),
      username$: of('admin'),
      userRole$: of('Admin')
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SupplierComponent],
      providers: [
        { provide: SupplierDataService, useValue: mockSupplierService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    mockSupplierService.getAll.and.returnValue(of(mockSuppliers));

    fixture = TestBed.createComponent(SupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load suppliers on init', () => {
    expect(mockSupplierService.getAll).toHaveBeenCalled();
    expect(component.suppliers.length).toBe(1);
    expect(component.filteredSuppliers.length).toBe(1);
  });

  it('should filter suppliers by search term', () => {
    component.searchTerm = 'Test';
    component.filterSuppliers();
    expect(component.filteredSuppliers.length).toBe(1);

    component.searchTerm = 'NonExistent';
    component.filterSuppliers();
    expect(component.filteredSuppliers.length).toBe(0);
  });

  it('should sort suppliers by name', () => {
    const suppliers = [
      { ...mockSuppliers[0], supplier_name: 'B Supplier' },
      { ...mockSuppliers[0], supplier_name: 'A Supplier' }
    ];
    component.suppliers = suppliers;
    component.sortBy = 'supplier_name';
    component.filterSuppliers();

    expect(component.filteredSuppliers[0].supplier_name).toBe('A Supplier');
    expect(component.filteredSuppliers[1].supplier_name).toBe('B Supplier');
  });

  it('should sort suppliers by reliability score (descending)', () => {
    const suppliers = [
      { ...mockSuppliers[0], reliability_score: 80 },
      { ...mockSuppliers[0], reliability_score: 95 }
    ];
    component.suppliers = suppliers;
    component.sortBy = 'reliability_score';
    component.filterSuppliers();

    expect(component.filteredSuppliers[0].reliability_score).toBe(95);
    expect(component.filteredSuppliers[1].reliability_score).toBe(80);
  });

  it('should get correct reliability class', () => {
    expect(component.getReliabilityClass(95)).toContain('green');
    expect(component.getReliabilityClass(85)).toContain('yellow');
    expect(component.getReliabilityClass(70)).toContain('red');
  });

  it('should calculate average rating correctly', () => {
    const supplier = mockSuppliers[0];
    const avgRating = component.getAverageRating(supplier);
    expect(avgRating).toBe(4.5); // (5 + 4) / 2
  });

  it('should return 0 for average rating when no reviews', () => {
    const supplier = { ...mockSuppliers[0], performance_reviews: [] };
    expect(component.getAverageRating(supplier)).toBe(0);
  });

  it('should open add modal', () => {
    component.openAddModal();
    expect(component.showSupplierModal).toBe(true);
    expect(component.editingSupplier).toBe(null);
  });

  it('should open edit modal with supplier data', () => {
    const supplier = mockSuppliers[0];
    component.openEditModal(supplier);
    expect(component.showSupplierModal).toBe(true);
    expect(component.editingSupplier).toBe(supplier);
    expect(component.supplierForm.supplier_name).toBe(supplier.supplier_name);
  });

  it('should close supplier modal', () => {
    component.showSupplierModal = true;
    component.editingSupplier = mockSuppliers[0];
    component.closeSupplierModal();
    expect(component.showSupplierModal).toBe(false);
    expect(component.editingSupplier).toBe(null);
  });

  it('should create new supplier', () => {
    const newSupplier = mockSuppliers[0];
    mockSupplierService.create.and.returnValue(of(newSupplier));

    component.editingSupplier = null;
    component.supplierForm = { ...newSupplier };
    component.saveSupplier();

    expect(mockSupplierService.create).toHaveBeenCalled();
  });

  it('should update existing supplier', () => {
    const supplier = mockSuppliers[0];
    mockSupplierService.update.and.returnValue(of(supplier));

    component.editingSupplier = supplier;
    component.supplierForm = { ...supplier };
    component.saveSupplier();

    expect(mockSupplierService.update).toHaveBeenCalledWith(supplier._id, jasmine.any(Object));
  });

  it('should open delete modal', () => {
    const supplier = mockSuppliers[0];
    component.openDeleteModal(supplier);
    expect(component.showDeleteModal).toBe(true);
    expect(component.deletingSupplier).toBe(supplier);
  });

  it('should close delete modal', () => {
    component.showDeleteModal = true;
    component.deletingSupplier = mockSuppliers[0];
    component.closeDeleteModal();
    expect(component.showDeleteModal).toBe(false);
    expect(component.deletingSupplier).toBe(null);
  });

  it('should delete supplier', () => {
    const supplier = mockSuppliers[0];
    mockSupplierService.delete.and.returnValue(of(void 0));

    component.deletingSupplier = supplier;
    component.confirmDelete();

    expect(mockSupplierService.delete).toHaveBeenCalledWith(supplier._id);
  });

  it('should open detail sheet', () => {
    const supplier = mockSuppliers[0];
    component.openDetailSheet(supplier);
    expect(component.showDetailSheet).toBe(true);
    expect(component.viewingSupplier).toBe(supplier);
  });

  it('should close detail sheet', () => {
    component.showDetailSheet = true;
    component.viewingSupplier = mockSuppliers[0];
    component.closeDetailSheet();
    expect(component.showDetailSheet).toBe(false);
    expect(component.viewingSupplier).toBe(null);
  });

  it('should check if user is admin', () => {
    component.userRole = 'Admin';
    expect(component.isAdmin()).toBe(true);

    component.userRole = 'Staff';
    expect(component.isAdmin()).toBe(false);
  });

  it('should handle error when loading suppliers', () => {
    mockSupplierService.getAll.and.returnValue(throwError(() => new Error('Load failed')));
    component.loadSuppliers();
    expect(component.error).toBe('Load failed');
  });

  it('should navigate to login when not authenticated', () => {
    (mockAuthService as any).isAuthenticated$ = of(false);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
