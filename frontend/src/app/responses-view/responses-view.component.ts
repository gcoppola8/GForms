import { Component, inject } from '@angular/core';
import { FormService } from '../../services/gforms-backend.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-responses-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './responses-view.component.html',
  styleUrl: './responses-view.component.css'
})
export class ResponsesViewComponent {
  private formService = inject(FormService);
  private route = inject(ActivatedRoute);

  formId: string | null = null;
  responses: any[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.formId = this.route.snapshot.paramMap.get('id');

    if (this.formId) {
      this.loadResponses(this.formId);
    } else {
      console.error('Form ID not found in route parameters!');
      this.error = 'Could not determine the form ID from the URL.';
      this.isLoading = false;
    }
  }

  loadResponses(formId: string): void {
    this.isLoading = true;
    this.error = null;
    this.formService.getFormResponses(formId).subscribe({
      next: (data) => {
        this.responses = data;
        this.isLoading = false;
        console.log(`Responses for form ${formId}:`, this.responses);
      },
      error: (err) => {
        console.error(`Error loading responses for form ${formId}:`, err);
        this.error = 'Could not load responses for this form.';
        this.isLoading = false;
      }
    });
  }
}
