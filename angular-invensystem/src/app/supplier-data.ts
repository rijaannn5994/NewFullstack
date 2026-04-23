import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class SupplierDataService {
  private apiUrl = 'http://localhost:5001/api/suppliers';

  constructor(private http: HttpClient) {}

  // Update this method
  getAll(page: number = 1, pageSize: number = 10): Observable<Supplier[]> {
    let params = new HttpParams()
      .set('pn', page.toString())
      .set('ps', pageSize.toString());
      
    return this.http.get<Supplier[]>(this.apiUrl, { params });
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
