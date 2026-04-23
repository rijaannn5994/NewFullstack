import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryComponent } from './inventory';
import { InventoryDataService } from '../inventory-data';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;
  let mockInventoryService: jasmine.SpyObj<InventoryDataService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockItems = [
    {
      _id: '1',
      item_id: 'INV-001',
      item_name: 'Test Item',
      category: 'IT Equipment',
      quantity_in_stock: 10,
      reorder_level: 5,
      supplier_id: 'SUP-001',
      unit_price: 100,
      last_updated: '2026-01-01T00:00:00Z',
      specifications: {
        weight_kg: 1,
        dimensions_cm: { length: 10, width: 10, height: 10 },
        materials: ['plastic']
      },
      photos: []
    }
  ];

  beforeEach(async () => {
    mockInventoryService = jasmine.createSpyObj('InventoryDataService', [
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
      imports: [InventoryComponent],
      providers: [
        { provide: InventoryDataService, useValue: mockInventoryService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    mockInventoryService.getAll.and.returnValue(of(mockItems));

    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load items on init', () => {
    expect(mockInventoryService.getAll).toHaveBeenCalled();
    expect(component.items.length).toBe(1);
    expect(component.filteredItems.length).toBe(1);
  });

  it('should filter items by search term', () => {
    component.searchTerm = 'Test';
    component.filterItems();
    expect(component.filteredItems.length).toBe(1);

    component.searchTerm = 'NonExistent';
    component.filterItems();
    expect(component.filteredItems.length).toBe(0);
  });

  it('should filter items by category', () => {
    component.selectedCategory = 'IT Equipment';
    component.filterItems();
    expect(component.filteredItems.length).toBe(1);

    component.selectedCategory = 'Office Furniture';
    component.filterItems();
    expect(component.filteredItems.length).toBe(0);
  });

  it('should get correct stock status', () => {
    const item = mockItems[0];
    expect(component.getStockStatus(item)).toBe('In Stock');

    item.quantity_in_stock = 0;
    expect(component.getStockStatus(item)).toBe('Out of Stock');

    item.quantity_in_stock = 3;
    expect(component.getStockStatus(item)).toBe('Low Stock');
  });

  it('should open add modal', () => {
    component.openAddModal();
    expect(component.showItemModal).toBe(true);
    expect(component.editingItem).toBe(null);
  });

  it('should open edit modal with item data', () => {
    const item = mockItems[0];
    component.openEditModal(item);
    expect(component.showItemModal).toBe(true);
    expect(component.editingItem).toBe(item);
    expect(component.itemForm.item_name).toBe(item.item_name);
  });

  it('should close item modal', () => {
    component.showItemModal = true;
    component.editingItem = mockItems[0];
    component.closeItemModal();
    expect(component.showItemModal).toBe(false);
    expect(component.editingItem).toBe(null);
  });

  it('should create new item', () => {
    const newItem = mockItems[0];
    mockInventoryService.create.and.returnValue(of(newItem));

    component.editingItem = null;
    component.itemForm = { ...newItem };
    component.saveItem();

    expect(mockInventoryService.create).toHaveBeenCalled();
  });

  it('should update existing item', () => {
    const item = mockItems[0];
    mockInventoryService.update.and.returnValue(of(item));

    component.editingItem = item;
    component.itemForm = { ...item };
    component.saveItem();

    expect(mockInventoryService.update).toHaveBeenCalledWith(item._id, jasmine.any(Object));
  });

  it('should open delete modal', () => {
    const item = mockItems[0];
    component.openDeleteModal(item);
    expect(component.showDeleteModal).toBe(true);
    expect(component.deletingItem).toBe(item);
  });

  it('should delete item', () => {
    const item = mockItems[0];
    mockInventoryService.delete.and.returnValue(of(void 0));

    component.deletingItem = item;
    component.confirmDelete();

    expect(mockInventoryService.delete).toHaveBeenCalledWith(item._id);
  });

  it('should open detail sheet', () => {
    const item = mockItems[0];
    component.openDetailSheet(item);
    expect(component.showDetailSheet).toBe(true);
    expect(component.viewingItem).toBe(item);
  });

  it('should close detail sheet', () => {
    component.showDetailSheet = true;
    component.viewingItem = mockItems[0];
    component.closeDetailSheet();
    expect(component.showDetailSheet).toBe(false);
    expect(component.viewingItem).toBe(null);
  });

  it('should check if user is admin', () => {
    component.userRole = 'Admin';
    expect(component.isAdmin()).toBe(true);

    component.userRole = 'Staff';
    expect(component.isAdmin()).toBe(false);
  });

  it('should handle error when loading items', () => {
    mockInventoryService.getAll.and.returnValue(throwError(() => new Error('Load failed')));
    component.loadItems();
    expect(component.error).toBe('Load failed');
  });
});
