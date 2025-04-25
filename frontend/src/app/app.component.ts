import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// Import RouterLink along with RouterOutlet
import { RouterOutlet, RouterLink } from '@angular/router';
import { Form, FormService } from '../services/gforms-backend.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  // Add RouterLink here:
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  title = 'gforms-app';
  forms: Form[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private gformsService: FormService) { }

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.isLoading = true;
    this.error = null;

    this.gformsService.getForms().subscribe({
      next: (data) => {
        this.forms = data;
        this.isLoading = false;
        console.log('Forms loaded:', this.forms);
      },
      error: (err) => {
        console.error('Error loading forms:', err);
        // Consider providing a more user-friendly error message or using the one from the service
        this.error = 'Could not load forms. Please check your connection or try again later.';
        this.isLoading = false;
      }
    });
  }
}
