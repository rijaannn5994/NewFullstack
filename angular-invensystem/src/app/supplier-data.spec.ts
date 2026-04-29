import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { SupplierDataService } from "./supplier-data";

describe("SupplierDataService", () => {
  let service: SupplierDataService;
  let httpMock: HttpTestingController;
  const apiUrl = "http://localhost:5001/api/suppliers";

  const mockSupplier = {
    _id: "1",
    supplier_id: "SUP-001",
    supplier_name: "Test Supplier Ltd.",
    email: "test@supplier.com",
    phone: "+44 7700 900000",
    reliability_score: 95,
    address: {
      street: "123 Test Street",
      city: "London",
      postcode: "SW1A 1AA",
      country: "UK",
    },
    performance_reviews: [
      {
        date: "2026-01-01T00:00:00Z",
        rating: 5,
        comment: "Excellent service",
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SupplierDataService],
    });
    service = TestBed.inject(SupplierDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should get all suppliers", () => {
    const mockSuppliers = [mockSupplier];

    service.getAll().subscribe((suppliers) => {
      expect(suppliers.length).toBe(1);
      expect(suppliers[0]).toEqual(mockSupplier);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe("GET");
    req.flush(mockSuppliers);
  });

  it("should fallback to mock data when API fails", () => {
    service.getAll().subscribe((suppliers) => {
      expect(suppliers.length).toBeGreaterThan(0);
      expect(suppliers[0]._id).toBeDefined();
    });

    const req = httpMock.expectOne(apiUrl);
    req.error(new ProgressEvent("Network error"));
  });

  it("should get supplier by id", () => {
    const id = "1";

    service.getById(id).subscribe((supplier) => {
      expect(supplier).toEqual(mockSupplier);
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe("GET");
    req.flush(mockSupplier);
  });

  it("should create supplier", () => {
    const newSupplier = { ...mockSupplier };
    delete (newSupplier as any)._id;

    service.create(newSupplier).subscribe((supplier) => {
      expect(supplier).toEqual(mockSupplier);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(newSupplier);
    req.flush(mockSupplier);
  });

  it("should update supplier", () => {
    const id = "1";
    const updatedSupplier = { ...mockSupplier };
    delete (updatedSupplier as any)._id;

    service.update(id, updatedSupplier).subscribe((supplier) => {
      expect(supplier).toEqual(mockSupplier);
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(updatedSupplier);
    req.flush(mockSupplier);
  });

  it("should delete supplier", () => {
    const id = "1";

    service.delete(id).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe("DELETE");
    req.flush(null);
  });

  it("should add review", () => {
    const id = "1";
    const review = {
      date: "2026-01-01T00:00:00Z",
      rating: 5,
      comment: "Great service",
    };

    service.addReview(id, review).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}/reviews`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(review);
    req.flush({ success: true });
  });
});
