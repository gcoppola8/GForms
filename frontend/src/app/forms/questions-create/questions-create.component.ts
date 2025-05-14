import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Form,
  FormService,
  Question,
} from '../../../services/gforms-backend.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';

@Component({
  selector: 'app-questions-create',
  templateUrl: './questions-create.component.html',
  imports: [CommonModule, FormsModule, ClarityModule],
  standalone: true,
})
export class QuestionsCreateComponent implements OnInit {
  // Array to hold all the questions
  questions: Question[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  forms: any;

  private routeSub: Subscription | undefined;
  private formSub: Subscription | undefined;
  form: Form | null = null;

  constructor(
    private formService: FormService,
    private route: ActivatedRoute
  ) {}

  // Initialize the component
  ngOnInit(): void {
    // Start with one empty question when the component loads
    this.addQuestion();

    this.routeSub = this.route.paramMap.subscribe((params) => {
      const formId = params.get('id');
      if (formId) {
        this.loadFormDetails(formId);
      } else {
        this.error = 'Form ID not found in route.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.formSub?.unsubscribe();
    // this.responsesSub?.unsubscribe(); // Unsubscribe from responses
  }

  loadFormDetails(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.form = null;

    this.formSub = this.formService.getFormById(id).subscribe({
      next: (data) => {
        this.form = data;
        this.isLoading = false;
        console.log('Form details loaded:', this.form);
        this.questions = this.form.questions;
      },
      error: (err) => {
        console.error('Error loading form details:', err);
        this.error = err.message || 'Could not load form details.';
        this.isLoading = false;
      },
    });
  }

  // Adds a new blank question to the array
  addQuestion(): void {
    this.questions.push({
      id: crypto.randomUUID(),
      text: '',
      type: '', // Default to empty, user must select
      extra_info: '',
      is_required: false,
      created_at: '',
      updated_at: '',
      options_text: '',
    });
  }

  // Removes a question from the array based on its index
  removeQuestion(index: number): void {
    // Prevent removing the last question if you always want at least one
    // if (this.questions.length > 1) {
    this.questions.splice(index, 1);
    // } else {
    //   console.warn("Cannot remove the last question.");
    //   // Optionally, provide user feedback (e.g., using a toast notification)
    // }
  }

  // Handles the form submission
  onSubmit(): void {
    console.log('Form Submitted!');
    console.log('Questions Data:', this.questions);
    // Here you would typically send the 'this.questions' array
    // to your backend service or perform other actions.
    // Example: this.formService.saveQuestions(this.questions).subscribe(...);

    // You might want to add validation here before submitting
    if (this.isFormValid()) {
      console.log('Form is valid, proceeding with submission...');
      // Add submission logic here
    } else {
      console.error('Form is invalid. Please check the fields.');
      // Optionally, provide user feedback
    }
  }

  // Optional: Basic validation check
  isFormValid(): boolean {
    return this.questions.every((q) => q.text && q.type);
    // Add more complex validation as needed
  }

  clearOptions(idx: number) {
    this.questions[idx].options_text = '';
  }
}
