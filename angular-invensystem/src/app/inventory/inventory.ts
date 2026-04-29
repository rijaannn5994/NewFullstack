import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { InventoryDataService, InventoryItem } from '../inventory-data';
import { NavigationComponent } from '../navigation/navigation';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class InventoryComponent implements OnInit {
  
  // State, Form, and UI variables
  items: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  categories: string[] = [];
  searchTerm = '';
  selectedCategory = 'all';
  sortBy = 'item_name';
  userRole: 'Admin' | 'Staff' | null = null;
  username: string | null = null;
  isLoading = true;
  error: string | null = null;
  showItemModal = false;
  showDeleteModal = false;
  showDetailSheet = false;
  editingItem: InventoryItem | null = null;
  deletingItem: InventoryItem | null = null;
  viewingItem: InventoryItem | null = null;
  itemForm: Partial<InventoryItem> = this.getEmptyForm();
  selectedFile: File | null = null;
  currentPage = 1;
  pageSize = 12;
  hasNextPage = true; 

  constructor(
    private inventoryService: InventoryDataService,
    private authService: AuthService,
    private router: Router
  ) {}

  // Initialization & Auth check
  ngOnInit(): void {
    this.authService.userRole$.subscribe(role => this.userRole = role);
    this.authService.username$.subscribe(name => this.username = name);
    this.authService.isAuthenticated$.subscribe(auth => {
      if (!auth) this.router.navigate(['/login']);
    });
    this.loadItems();
  }

  // Search, Filter, and Sort logic
  onSearch(): void {
    this.currentPage = 1;
    this.loadItems();
  }

  onCategoryChange(): void { this.filterItems(); }
  onSortChange(): void { this.filterItems(); }

  filterItems(): void {
    let filtered = [...this.items];

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    filtered.sort((a, b) => {
      const aVal = a[this.sortBy as keyof InventoryItem];
      const bVal = b[this.sortBy as keyof InventoryItem];
      if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal);
      if (typeof aVal === 'number' && typeof bVal === 'number') return aVal - bVal;
      return 0;
    });

    this.filteredItems = filtered;
  }

  // UI Helpers
  getStockStatus(item: InventoryItem): string {
    if (item.quantity_in_stock === 0) return 'Out of Stock';
    if (item.quantity_in_stock <= item.reorder_level) return 'Low Stock';
    return 'In Stock';
  }

  getStatusClass(item: InventoryItem): string {
    const status = this.getStockStatus(item);
    if (status === 'Out of Stock') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'Low Stock') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  }

  isAdmin(): boolean {
    return this.userRole === 'Admin';
  }

  getPhotoUrl(photoPath: string | undefined): string {
    if (!photoPath) return 'https://via.placeholder.com/150?text=No+Image'; 
    if (photoPath.startsWith('data:image')) return photoPath;
    return `http://localhost:5001${photoPath}`;
  }

  // Modal Toggles
  openAddModal(): void {
    this.editingItem = null;
    this.itemForm = this.getEmptyForm();
    this.selectedFile = null;
    this.showItemModal = true;
  }

  openEditModal(item: InventoryItem): void {
    this.editingItem = item;
    this.itemForm = { ...item };
    this.selectedFile = null;
    this.showItemModal = true;
  }

  closeItemModal(): void {
    this.showItemModal = false;
    this.editingItem = null;
    this.itemForm = this.getEmptyForm();
  }

  openDeleteModal(item: InventoryItem): void {
    this.deletingItem = item;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingItem = null;
  }

  openDetailSheet(item: InventoryItem): void {
    this.viewingItem = item;
    this.showDetailSheet = true;
  }

  closeDetailSheet(): void {
    this.showDetailSheet = false;
    this.viewingItem = null;
  }

  // CRUD Operations & Data Fetching
  saveItem(): void {
    const itemData = this.prepareItemData();
    const targetId = this.editingItem ? this.editingItem.item_id : itemData.item_id;

    if (this.editingItem) {
      this.inventoryService.update(targetId, itemData).subscribe({
        next: () => this.handleImageUpload(targetId),
        error: (err) => alert("Failed to save item: " + err.message)
      });
    } else {
      this.inventoryService.create(itemData).subscribe({
        next: () => this.handleImageUpload(targetId),
        error: (err) => alert("Failed to create item: " + err.message)
      });
    }
  }

  confirmDelete(): void {
    if (this.deletingItem) {
      this.inventoryService.delete(this.deletingItem.item_id).subscribe({
        next: () => {
          this.loadItems();
          this.closeDeleteModal();
        },
        error: (err) => this.error = err.message
      });
    }
  }

  loadItems(): void {
    this.isLoading = true;
    this.error = null;

    this.inventoryService.getAll(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (data) => {
        this.items = data;
        this.hasNextPage = data.length === this.pageSize;
        const uniqueCategories = new Set(data.map(item => item.category));
        this.categories = Array.from(uniqueCategories).filter(cat => cat); 
        this.filterItems(); 
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadItems();
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadItems();
    }
  }  

  // File Upload Handling
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  handleImageUpload(itemId: string): void {
    if (this.selectedFile) {
      this.inventoryService.uploadPhoto(itemId, this.selectedFile).subscribe({
        next: () => {
          this.loadItems();
          this.closeItemModal();
        },
        error: (err) => {
          alert("Item saved, but image upload failed.");
          this.loadItems();
          this.closeItemModal();
        }
      });
    } else {
      this.loadItems();
      this.closeItemModal();
    }
  }

  // Data Preparation Helpers
  private getEmptyForm(): Partial<InventoryItem> {
    return {
      item_id: '', item_name: '', category: '', quantity_in_stock: 0,
      reorder_level: 0, supplier_id: '', unit_price: 0,
      last_updated: new Date().toISOString(),
      specifications: { weight_kg: 0, dimensions_cm: { length: 0, width: 0, height: 0 }, materials: [] },
      photos: []
    };
  }

  private prepareItemData(): Omit<InventoryItem, '_id'> {
    return {
      item_id: this.itemForm.item_id!,
      item_name: this.itemForm.item_name!,
      category: this.itemForm.category!,
      quantity_in_stock: Number(this.itemForm.quantity_in_stock),
      reorder_level: Number(this.itemForm.reorder_level),
      supplier_id: this.itemForm.supplier_id!,
      unit_price: Number(this.itemForm.unit_price),
      last_updated: new Date().toISOString(),
      specifications: this.itemForm.specifications!,
      photos: this.itemForm.photos || []
    };
  }
}