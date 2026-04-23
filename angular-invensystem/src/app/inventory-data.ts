import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface InventoryItem {
  _id: string;
  item_id: string;
  item_name: string;
  category: string;
  quantity_in_stock: number;
  reorder_level: number;
  supplier_id: string;
  unit_price: number;
  last_updated: string;
  specifications: {
    weight_kg: number;
    dimensions_cm: {
      length: number;
      width: number;
      height: number;
    };
    materials: string[];
  };
  photos?: string[];
}

const MOCK_ITEMS: InventoryItem[] = [
  {
    _id: '69aebba78376556264e3302f',
    item_id: 'INV-0001',
    item_name: 'Corporate IT Equipment Product 1',
    category: 'IT Equipment',
    quantity_in_stock: 165,
    reorder_level: 18,
    supplier_id: 'SUP-081',
    unit_price: 164.55,
    last_updated: '2026-02-12T17:05:51.558005Z',
    specifications: {
      weight_kg: 4.68,
      dimensions_cm: { length: 135, width: 68, height: 2 },
      materials: ['wood', 'steel'],
    },
    photos: [],
  },
  {
    _id: '69aebba78376556264e33030',
    item_id: 'INV-0002',
    item_name: 'Office Desk Chair Premium',
    category: 'Office Furniture',
    quantity_in_stock: 12,
    reorder_level: 25,
    supplier_id: 'SUP-002',
    unit_price: 289.99,
    last_updated: '2026-04-01T10:30:00.000000Z',
    specifications: {
      weight_kg: 15.5,
      dimensions_cm: { length: 70, width: 70, height: 120 },
      materials: ['leather', 'metal', 'plastic'],
    },
    photos: [],
  },
  {
    _id: '69aebba78376556264e33031',
    item_id: 'INV-0003',
    item_name: 'Wireless Mouse Set',
    category: 'IT Equipment',
    quantity_in_stock: 0,
    reorder_level: 50,
    supplier_id: 'SUP-081',
    unit_price: 45.00,
    last_updated: '2026-03-15T08:20:15.000000Z',
    specifications: {
      weight_kg: 0.3,
      dimensions_cm: { length: 12, width: 7, height: 4 },
      materials: ['plastic', 'rubber'],
    },
    photos: [],
  },
  {
    _id: '69aebba78376556264e33032',
    item_id: 'INV-0004',
    item_name: 'LED Monitor 27 inch',
    category: 'IT Equipment',
    quantity_in_stock: 78,
    reorder_level: 30,
    supplier_id: 'SUP-002',
    unit_price: 425.00,
    last_updated: '2026-04-18T14:45:30.000000Z',
    specifications: {
      weight_kg: 6.2,
      dimensions_cm: { length: 61, width: 45, height: 5 },
      materials: ['plastic', 'glass', 'metal'],
    },
    photos: [],
  },
];

@Injectable({
  providedIn: 'root'
})
export class InventoryDataService {
  private apiUrl = 'http://localhost:5000/api/inventory/items';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl).pipe(
      catchError(() => of(MOCK_ITEMS))
    );
  }

  getById(id: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`);
  }

  create(item: Omit<InventoryItem, '_id'>): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl, item);
  }

  update(id: string, item: Omit<InventoryItem, '_id'>): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, item);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadPhoto(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(`${this.apiUrl}/${id}/photos`, formData);
  }
}
