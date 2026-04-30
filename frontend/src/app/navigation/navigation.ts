import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-navigation",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./navigation.html",
  styleUrls: ["./navigation.css"],
})
export class NavigationComponent implements OnInit {
  // Component Inputs/Outputs and State
  @Input() currentPage: "home" | "inventory" | "supplier" | "pos" = "home";
  @Output() logout = new EventEmitter<void>();
  username: string | null = null;
  userRole: "Admin" | "Staff" | null = null;
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    public router: Router,
  ) {}

  // Initialization & Auth state subscriptions
  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe((auth) => {
      this.isAuthenticated = auth;
    });
    this.authService.username$.subscribe((name) => {
      this.username = name;
    });
    this.authService.userRole$.subscribe((role) => {
      this.userRole = role;
    });
  }

  // Navigation Routing
  navigateHome(): void {
    this.router.navigate(["/home"]);
  }

  navigateInventory(): void {
    this.router.navigate(["/inventory"]);
  }

  navigateSuppliers(): void {
    this.router.navigate(["/supplier"]);
  }

  navigatePos(): void {
    this.router.navigate(["/pos"]);
  }

  // Logout logic
  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.logout.emit();
      this.router.navigate(["/login"]);
    });
  }

  // UI Active state checker
  isActive(page: string): boolean {
    return this.currentPage === page;
  }
}
