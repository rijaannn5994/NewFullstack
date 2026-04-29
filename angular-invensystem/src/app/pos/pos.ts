import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NavigationComponent } from '../navigation/navigation';
import { InventoryDataService, InventoryItem } from '../inventory-data';

export interface CartItem {
  item: InventoryItem;
  quantity: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  templateUrl: './pos.html',
  styleUrls: ['./pos.css']
})
export class PosComponent implements OnInit {
  // All items for the grid
  allItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  categories: string[] = [];
  selectedCategory = 'all';
  isLoadingItems = true;

  // Search
  searchTerm = '';
  searchTimeout: any;

  // Cart
  cart: CartItem[] = [];

  // UI state
  isProcessing = false;
  showBill = false;
  currentSale: any = null;
  username: string | null = null;
  userRole: 'Admin' | 'Staff' | null = null;
  error: string | null = null;

  readonly VAT_RATE = 0.20;

  constructor(
    private inventoryService: InventoryDataService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.userRole$.subscribe(role => this.userRole = role);
    this.authService.username$.subscribe(name => this.username = name);
    this.authService.isAuthenticated$.subscribe(auth => {
      if (!auth) this.router.navigate(['/login']);
    });
    this.loadAllItems();
  }

  loadAllItems(): void {
    this.isLoadingItems = true;
    this.inventoryService.getAll(1, 100, '').subscribe({
      next: (items) => {
        this.allItems = items;
        this.categories = [...new Set(items.map(i => i.category).filter(Boolean))];
        this.applyFilter();
        this.isLoadingItems = false;
      },
      error: () => { this.isLoadingItems = false; }
    });
  }

  applyFilter(): void {
    let items = this.allItems.filter(i => i.quantity_in_stock > 0);
    if (this.selectedCategory !== 'all') {
      items = items.filter(i => i.category === this.selectedCategory);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      items = items.filter(i =>
        i.item_name.toLowerCase().includes(term) ||
        i.item_id.toLowerCase().includes(term) ||
        i.category.toLowerCase().includes(term)
      );
    }
    this.filteredItems = items;
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilter(), 200);
  }

  onCategoryChange(): void { this.applyFilter(); }

  // --- Cart ---
  addToCart(item: InventoryItem): void {
    if (item.quantity_in_stock === 0) return;
    const existing = this.cart.find(c => c.item.item_id === item.item_id);
    if (existing) {
      if (existing.quantity < item.quantity_in_stock) existing.quantity++;
    } else {
      this.cart.push({ item, quantity: 1 });
    }
  }

  removeFromCart(itemId: string): void {
    this.cart = this.cart.filter(c => c.item.item_id !== itemId);
  }

  updateQuantity(cartItem: CartItem, delta: number): void {
    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) {
      this.removeFromCart(cartItem.item.item_id);
    } else if (newQty <= cartItem.item.quantity_in_stock) {
      cartItem.quantity = newQty;
    }
  }

  setQuantity(cartItem: CartItem, value: number): void {
    if (value <= 0) {
      this.removeFromCart(cartItem.item.item_id);
    } else if (value <= cartItem.item.quantity_in_stock) {
      cartItem.quantity = value;
    } else {
      cartItem.quantity = cartItem.item.quantity_in_stock;
    }
  }

  clearCart(): void { this.cart = []; }

  isInCart(itemId: string): boolean {
    return this.cart.some(c => c.item.item_id === itemId);
  }

  getCartQty(itemId: string): number {
    return this.cart.find(c => c.item.item_id === itemId)?.quantity ?? 0;
  }

  // --- Totals ---
  get subtotal(): number {
    return this.cart.reduce((sum, c) => sum + c.item.unit_price * c.quantity, 0);
  }
  get vatAmount(): number { return this.subtotal * this.VAT_RATE; }
  get total(): number { return this.subtotal + this.vatAmount; }
  get totalItems(): number { return this.cart.reduce((sum, c) => sum + c.quantity, 0); }

  // --- Process Sale ---
  processSale(): void {
    if (this.cart.length === 0) return;
    this.isProcessing = true;
    this.error = null;

    const updates = this.cart.map(cartItem =>
      this.inventoryService.update(cartItem.item.item_id, {
        ...cartItem.item,
        quantity_in_stock: cartItem.item.quantity_in_stock - cartItem.quantity,
      })
    );

    let completed = 0;
    let failed = false;

    updates.forEach(update$ => {
      update$.subscribe({
        next: () => {
          completed++;
          if (completed === updates.length && !failed) this.generateBill();
        },
        error: () => {
          if (!failed) {
            failed = true;
            this.error = 'Sale failed — stock could not be updated. Please try again.';
            this.isProcessing = false;
          }
        }
      });
    });
  }

  private generateBill(): void {
    this.currentSale = {
      saleId: 'SALE-' + Date.now(),
      date: new Date(),
      servedBy: this.username,
      items: this.cart.map(c => ({
        item_id: c.item.item_id,
        item_name: c.item.item_name,
        category: c.item.category,
        quantity: c.quantity,
        unit_price: c.item.unit_price,
        line_total: c.item.unit_price * c.quantity
      })),
      subtotal: this.subtotal,
      vat: this.vatAmount,
      total: this.total,
    };
    this.isProcessing = false;
    this.showBill = true;
  }

  closeBill(): void {
    this.showBill = false;
    this.cart = [];
    this.currentSale = null;
    this.loadAllItems();
  }

  printBill(): void { window.print(); }

  getPhotoUrl(photoPath: string | undefined): string {
    if (!photoPath) return '';
    if (photoPath.startsWith('data:image')) return photoPath;
    return `http://localhost:5001${photoPath}`;
  }

  getStockClass(item: InventoryItem): string {
    if (item.quantity_in_stock === 0) return 'bg-red-100 text-red-700 border-red-200';
    if (item.quantity_in_stock <= item.reorder_level) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  getStockLabel(item: InventoryItem): string {
    if (item.quantity_in_stock === 0) return 'Out of Stock';
    if (item.quantity_in_stock <= item.reorder_level) return 'Low Stock';
    return 'In Stock';
  }
}