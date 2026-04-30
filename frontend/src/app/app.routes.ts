import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home";
import { LoginComponent } from "./login/login.component";
import { InventoryComponent } from "./inventory/inventory";
import { SupplierComponent } from "./supplier/supplier";
import { PosComponent } from "./pos/pos";
import { TestWSComponent } from "./testWS.component";

export const routes: Routes = [
  { path: "test", component: TestWSComponent,},
  { path: "home", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "inventory", component: InventoryComponent },
  { path: "supplier", component: SupplierComponent },
  { path: "pos", component: PosComponent },
  { path: "**", redirectTo: "/home" },
];
