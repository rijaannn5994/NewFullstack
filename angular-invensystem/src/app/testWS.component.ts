import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InventoryDataService } from "./inventory-data";
import { SupplierDataService } from "./supplier-data";

@Component({
  selector: "app-testws",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./testWS.component.html",
})
export class TestWSComponent implements OnInit {
  test_output: string[] = [];

  constructor(
    private inventoryData: InventoryDataService,
    private supplierData: SupplierDataService,
  ) {}

  private testInventoryFetched() {
    // FIX: Added (1, 10) because your service requires pn and ps
    this.inventoryData.getAll(1, 10).subscribe((response: any) => {
      if (Array.isArray(response))
        this.test_output.push("Inventory fetched... PASS");
      else this.test_output.push("Inventory fetched... FAIL");
    });
  }

  private testSuppliersFetched() {
    this.supplierData.getAll().subscribe((response: any) => {
      if (Array.isArray(response))
        this.test_output.push("Suppliers fetched... PASS");
      else this.test_output.push("Suppliers fetched... FAIL");
    });
  }

  private testInventoryHasData() {
    // FIX: Added (1, 10) to match service signature
    this.inventoryData.getAll(1, 10).subscribe((response: any) => {
      if (response && response.length > 0)
        this.test_output.push("Inventory contains data... PASS");
      else this.test_output.push("Inventory contains data... FAIL");
    });
  }

  private testCreateInventory() {
    const item = {
      item_id: "TEST001",
      item_name: "Test Product",
      category: "Testing",
      quantity_in_stock: 10,
      reorder_level: 2,
      supplier_id: "SUP001",
      unit_price: 5,
      last_updated: new Date().toISOString(),
      specifications: {
        weight_kg: 1,
        dimensions_cm: { length: 1, width: 1, height: 1 },
        materials: ["plastic"],
      },
    };

    this.inventoryData.create(item).subscribe({
      next: (res: any) => this.test_output.push("Create inventory... PASS"),
      error: () => this.test_output.push("Create inventory... FAIL"),
    });
  }

  private testUpdateInventory(id: string) {
    const updated = {
      item_id: "TEST001",
      item_name: "Updated Product",
      category: "Testing",
      quantity_in_stock: 99,
      reorder_level: 2,
      supplier_id: "SUP001",
      unit_price: 8,
      last_updated: new Date().toISOString(),
      specifications: {
        weight_kg: 2,
        dimensions_cm: { length: 2, width: 2, height: 2 },
        materials: ["metal"],
      },
    };

    this.inventoryData.update(id, updated).subscribe({
      next: () => this.test_output.push("Update inventory... PASS"),
      error: () => this.test_output.push("Update inventory... FAIL"),
    });
  }

  // FIX: Added (id: string) parameter to the function definition
  private testDeleteInventory(id: string) {
    // FIX: Changed .delete(any) to .delete(id)
    this.inventoryData.delete(id).subscribe({
      next: () => this.test_output.push("Delete inventory... PASS"),
      error: () => this.test_output.push("Delete inventory... FAIL"),
    });
  }

  ngOnInit() {
    this.testInventoryFetched();
    this.testCreateInventory();
    
    this.testUpdateInventory("0");
    this.testDeleteInventory("0");
    
    this.testInventoryFetched();
    this.testSuppliersFetched();
    this.testInventoryHasData();
  }
}