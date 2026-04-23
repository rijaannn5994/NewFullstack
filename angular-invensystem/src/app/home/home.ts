import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  isAuthenticated = false;
  username: string | null = null;
  userRole: 'Admin' | 'Staff' | null = null;
  showAboutModal = false;
  showContactForm = false;
  contactSubmitted = false;

  contactForm = {
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(auth => {
      this.isAuthenticated = auth;
    });
    this.authService.username$.subscribe(name => {
      this.username = name;
    });
    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
  }

  onGetStarted(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/inventory']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onDashboard(): void {
    this.router.navigate(['/inventory']);
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/home']);
    });
  }

  openAbout(): void {
    this.showAboutModal = true;
  }

  closeAbout(): void {
    this.showAboutModal = false;
  }

  scrollToContact(): void {
    this.showContactForm = true;
    setTimeout(() => {
      const element = document.getElementById('contact-section');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  submitContact(): void {
    this.contactSubmitted = true;
    setTimeout(() => {
      this.contactSubmitted = false;
      this.contactForm = {
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      };
    }, 3000);
  }
}
