import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Supplier {
  _id: string;
  supplier_id: string;
  supplier_name: string;
  email: string;
  phone: string;
  reliability_score: number;
  address: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  performance_reviews: {
    date: string;
    rating: number;
    comment: string;
  }[];
}

const MOCK_SUPPLIERS: Supplier[] = [
  {
    _id: '69aebbba8376556264e33095',
    supplier_id: 'SUP-002',
    supplier_name: 'Enterprise Supplier 2 Ltd.',
    email: 'contact@supplier2.co.uk',
    phone: '+44 7700 900260',
    reliability_score: 98,
    address: {
      street: '63 Industrial Way',
      city: 'Cardiff',
      postcode: 'E19 1AB',
      country: 'UK',
    },
    performance_reviews: [
      {
        date: '2025-08-31T17:05:51.551631Z',
        rating: 5,
        comment: 'Good overall service.',
      },
      {
        date: '2025-11-18T17:05:51.551635Z',
        rating: 5,
        comment: 'Delivery was prompt.',
      },
    ],
  },
  {
    _id: '69aebbba8376556264e33096',
    supplier_id: 'SUP-081',
    supplier_name: 'Tech Solutions UK Ltd.',
    email: 'sales@techsolutions.co.uk',
    phone: '+44 7700 900815',
    reliability_score: 92,
    address: {
      street: '125 Technology Park',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'UK',
    },
    performance_reviews: [
      {
        date: '2025-09-15T10:22:00.000000Z',
        rating: 4,
        comment: 'Reliable supplier with competitive pricing.',
      },
      {
        date: '2026-01-20T14:30:00.000000Z',
        rating: 5,
        comment: 'Excellent customer service and fast delivery.',
      },
    ],
  },
  {
    _id: '69aebbba8376556264e33097',
    supplier_id: 'SUP-045',
    supplier_name: 'Global Office Supplies Inc.',
    email: 'info@globalofficeinc.com',
    phone: '+44 7700 900450',
    reliability_score: 85,
    address: {
      street: '42 Commerce Street',
      city: 'Manchester',
      postcode: 'M1 2AB',
      country: 'UK',
    },
    performance_reviews: [
      {
        date: '2025-10-05T09:15:00.000000Z',
        rating: 4,
        comment: 'Good quality products, sometimes delivery delays.',
      },
    ],
  },
];

@Injectable({
  providedIn: 'root'
})
export class SupplierDataService {
  private apiUrl = 'http://localhost:5000/api/suppliers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl).pipe(
      catchError(() => of(MOCK_SUPPLIERS))
    );
  }

  getById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  create(supplier: Omit<Supplier, '_id'>): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, supplier);
  }

  update(id: string, supplier: Omit<Supplier, '_id'>): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addReview(id: string, review: { date: string; rating: number; comment: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reviews`, review);
  }
}
