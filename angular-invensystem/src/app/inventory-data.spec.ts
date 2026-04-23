import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InventoryDataService } from './inventory-data';

describe('InventoryDataService', () => {
  let service: InventoryDataService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:5000/api/inventory/items';

  const mockItem = {
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
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InventoryDataService]
    });
    service = TestBed.inject(InventoryDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all items', () => {
    const mockItems = [mockItem];

    service.getAll().subscribe(items => {
      expect(items.length).toBe(1);
      expect(items[0]).toEqual(mockItem);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockItems);
  });

  it('should fallback to mock data when API fails', () => {
    service.getAll().subscribe(items => {
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]._id).toBeDefined();
    });

    const req = httpMock.expectOne(apiUrl);
    req.error(new ProgressEvent('Network error'));
  });

  it('should get item by id', () => {
    const id = '1';

    service.getById(id).subscribe(item => {
      expect(item).toEqual(mockItem);
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockItem);
  });

  it('should create item', () => {
    const newItem = { ...mockItem };
    delete (newItem as any)._id;

    service.create(newItem).subscribe(item => {
      expect(item).toEqual(mockItem);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newItem);
    req.flush(mockItem);
  });

  it('should update item', () => {
    const id = '1';
    const updatedItem = { ...mockItem };
    delete (updatedItem as any)._id;

    service.update(id, updatedItem).subscribe(item => {
      expect(item).toEqual(mockItem);
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedItem);
    req.flush(mockItem);
  });

  it('should delete item', () => {
    const id = '1';

    service.delete(id).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should upload photo', () => {
    const id = '1';
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    service.uploadPhoto(id, file).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}/photos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ success: true });
  });
});
