import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

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

@Injectable({
  providedIn: "root",
})
export class InventoryDataService {
  // Ensure the port matches your Flask app (5000 or 5001 as previously discussed)
  private apiUrl = "http://localhost:5001/api/inventory";
  pageSize: number = 5;

  constructor(private http: HttpClient) {}

  getAll(
    page: number = 1,
    pageSize: number = 12,
    search: string = "",
  ): Observable<InventoryItem[]> {
    let params = new HttpParams()
      .set("pn", page.toString())
      .set("ps", pageSize.toString());

    if (search) {
      params = params.set("search", search); // Add search param if it exists
    }

    return this.http.get<InventoryItem[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`);
  }

  create(item: Omit<InventoryItem, "_id">): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl, item);
  }

  update(
    id: string,
    item: Omit<InventoryItem, "_id">,
  ): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, item);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadPhoto(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append("photo", file);
    return this.http.post(`${this.apiUrl}/${id}/photos`, formData);
  }
}
