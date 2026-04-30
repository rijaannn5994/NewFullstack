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
  
  ngOnInit() {
    this.testInventoryFetched();
    this.testSuppliersFetched();
    this.testInventoryHasData();
  }
}