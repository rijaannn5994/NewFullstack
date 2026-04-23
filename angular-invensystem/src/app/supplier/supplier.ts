import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { SupplierDataService, Supplier } from '../supplier-data';
import { NavigationComponent } from '../navigation/navigation';

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  templateUrl: './supplier.html',
  styleUrls: ['./supplier.css']
})
export class SupplierComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  searchTerm = '';
  sortBy = 'supplier_name';
  userRole: 'Admin' | 'Staff' | null = null;
  username: string | null = null;
  isLoading = true;
  error: string | null = null;

  // Modal state
  showSupplierModal = false;
  showDeleteModal = false;
  showDetailSheet = false;
  editingSupplier: Supplier | null = null;
  deletingSupplier: Supplier | null = null;
  viewingSupplier: Supplier | null = null;

  // Form data
  supplierForm: Partial<Supplier> = this.getEmptyForm();

  constructor(
    private supplierService: SupplierDataService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
    this.authService.username$.subscribe(name => {
      this.username = name;
    });
    this.authService.isAuthenticated$.subscribe(auth => {
      if (!auth) {
        this.router.navigate(['/login']);
      }
    });

    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.isLoading = true;
    this.error = null;

    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filterSuppliers();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.filterSuppliers();
  }

  onSortChange(): void {
    this.filterSuppliers();
  }

  filterSuppliers(): void {
    let filtered = [...this.suppliers];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(supplier =>
        supplier.supplier_name?.toLowerCase().includes(term) ||
        supplier.supplier_id?.toLowerCase().includes(term) ||
        supplier.email?.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[this.sortBy as keyof Supplier];
      const bVal = b[this.sortBy as keyof Supplier];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return bVal - aVal; // Descending for reliability score
      }
      return 0;
    });

    this.filteredSuppliers = filtered;
  }

  getReliabilityClass(score: number): string {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  }

  getAverageRating(supplier: Supplier): number {
    if (!supplier.performance_reviews || supplier.performance_reviews.length === 0) {
      return 0;
    }
    const sum = supplier.performance_reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / supplier.performance_reviews.length;
  }

  // CRUD Operations
  openAddModal(): void {
    this.editingSupplier = null;
    this.supplierForm = this.getEmptyForm();
    this.showSupplierModal = true;
  }

  openEditModal(supplier: Supplier): void {
    this.editingSupplier = supplier;
    this.supplierForm = { ...supplier };
    this.showSupplierModal = true;
  }

  closeSupplierModal(): void {
    this.showSupplierModal = false;
    this.editingSupplier = null;
    this.supplierForm = this.getEmptyForm();
  }

  saveSupplier(): void {
    const supplierData = this.prepareSupplierData();

    if (this.editingSupplier) {
      this.supplierService.update(this.editingSupplier._id, supplierData).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeSupplierModal();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    } else {
      this.supplierService.create(supplierData).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeSupplierModal();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    }
  }

  openDeleteModal(supplier: Supplier): void {
    this.deletingSupplier = supplier;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingSupplier = null;
  }

  confirmDelete(): void {
    if (this.deletingSupplier) {
      this.supplierService.delete(this.deletingSupplier._id).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeDeleteModal();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    }
  }

  openDetailSheet(supplier: Supplier): void {
    this.viewingSupplier = supplier;
    this.showDetailSheet = true;
  }

  closeDetailSheet(): void {
    this.showDetailSheet = false;
    this.viewingSupplier = null;
  }

  isAdmin(): boolean {
    return this.userRole === 'Admin';
  }

  private getEmptyForm(): Partial<Supplier> {
    return {
      supplier_id: '',
      supplier_name: '',
      email: '',
      phone: '',
      reliability_score: 0,
      address: {
        street: '',
        city: '',
        postcode: '',
        country: 'UK'
      },
      performance_reviews: []
    };
  }

  private prepareSupplierData(): Omit<Supplier, '_id'> {
    return {
      supplier_id: this.supplierForm.supplier_id!,
      supplier_name: this.supplierForm.supplier_name!,
      email: this.supplierForm.email!,
      phone: this.supplierForm.phone!,
      reliability_score: Number(this.supplierForm.reliability_score),
      address: this.supplierForm.address!,
      performance_reviews: this.supplierForm.performance_reviews || []
    };
  }
}
