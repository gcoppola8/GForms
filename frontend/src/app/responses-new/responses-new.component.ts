// c:\Users\genna\code\GForms\frontend\src\app\responses-new\responses-new.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  Form,
  FormService,
  Question,
  Answer, // Assuming Answer interface is defined in FormService
  FormResponse, // Assuming FormResponse interface is defined
} from '../../services/gforms-backend.service';
import { ActivatedRoute, Router } from '@angular/router';
// Import necessary modules for Reactive Forms
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { ClarityModule } from '@clr/angular'; // Import ClarityModule for UI components

@Component({
  selector: 'app-responses-new',
  standalone: true,
  // Add ReactiveFormsModule and ClarityModule
  imports: [CommonModule, ReactiveFormsModule, ClarityModule],
  templateUrl: './responses-new.component.html',
  styleUrls: ['./responses-new.component.css'], // Corrected from styleUrl
})
export class ResponsesNewComponent implements OnInit {
  // --- Injected Services ---
  private formService = inject(FormService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder); // Inject FormBuilder
  private router = inject(Router); // Inject Router for navigation after submit

  // --- Form Loading State ---
  formId: string | null = null;
  form: Form | null = null;
  isLoading = true;
  error: string | null = null;

  // --- Form Submission State ---
  responseForm!: FormGroup; // Use definite assignment assertion or initialize in constructor
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess = false;

  ngOnInit(): void {
    // Initialize the form group structure immediately
    this.responseForm = this.fb.group({
      answers: this.fb.array([]), // Initialize with an empty FormArray
    });

    this.formId = this.route.snapshot.paramMap.get('id');

    if (this.formId) {
      this.loadForm(this.formId);
    } else {
      console.error('Form ID not found in route parameters!');
      this.error = 'Could not determine the form ID from the URL.';
      this.isLoading = false;
    }
  }

  // --- Form Loading ---
  loadForm(formId: string): void {
    this.isLoading = true;
    this.error = null;
    this.formService.getFormById(formId).subscribe({
      next: (data) => {
        this.form = data;
        this.buildResponseForm(data.questions || []); // Build form controls after data arrives
        this.isLoading = false;
        console.log(`Form ${formId} loaded:`, this.form);
      },
      error: (err) => {
        console.error(`Error loading form ${formId}:`, err);
        // Use the error message from the service if available
        this.error = err.message || 'Could not load the form structure.';
        this.isLoading = false;
      },
    });
  }

  // --- Reactive Form Building ---
  buildResponseForm(questions: Question[]): void {
    const answersArray = this.responseForm.get('answers') as FormArray;
    answersArray.clear(); // Clear previous controls if any

    questions.forEach((question) => {
      const validators = [];
      if (question.is_required) {
        validators.push(Validators.required);
      }

      // Create a FormGroup for each question to hold the answer and question_id
      const questionGroup = this.fb.group({
        question_id: [question.id], // Store question ID, not editable
        answer: ['', validators], // The actual FormControl for the user's input
        // Add other controls if needed per question type (e.g., for multiple choice)
      });
      answersArray.push(questionGroup);
    });
  }

  // --- Template Helpers for FormArray ---
  get answersArray(): FormArray {
    return this.responseForm.get('answers') as FormArray;
  }

  // Helper to get a specific control group within the FormArray
  getAnswerControlGroup(index: number): FormGroup {
    return this.answersArray.at(index) as FormGroup;
  }

  // Helper to get the 'answer' FormControl from a specific group
  getAnswerControl(index: number): FormControl {
    return this.getAnswerControlGroup(index).get('answer') as FormControl;
  }

  // Helper to check if a specific answer control is invalid and touched
  isControlInvalid(index: number): boolean {
    const control = this.getAnswerControl(index);
    return control.invalid && (control.dirty || control.touched);
  }

  // --- Form Submission ---
  submitResponse(): void {
    if (this.responseForm.invalid || !this.formId) {
      // Mark all fields as touched to show validation errors
      this.responseForm.markAllAsTouched();
      console.warn('Form is invalid or Form ID is missing.');
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = false;

    // Prepare the payload for the backend
    const formValues = this.responseForm.value;
    const payloadAnswers: Omit<Answer, 'id' | 'response_id' | 'created_at' | 'updated_at'>[] =
      formValues.answers.map((ansGroup: { question_id: string; answer: string }) => ({
        question_id: ansGroup.question_id,
        answer_text: ansGroup.answer, // Map 'answer' from form to 'answer_text' for backend
      }));

    const payload: FormResponse = {
      form_id: this.formId,
      respondent_user_id: 'anonymous', // Replace with actual user ID if auth is implemented
      answers: payloadAnswers,
    };

    console.log('Submitting response payload:', payload);

    // *** IMPORTANT: You need to add a method to your FormService to handle this POST request ***
    this.formService.submitFormResponse(this.formId, payload).subscribe({
      next: (response) => {
        console.log('Response submitted successfully:', response);
        this.submitSuccess = true;
        this.isSubmitting = false;
        this.responseForm.reset(); // Optionally reset the form
        // Optionally navigate away after success
        // Example: Navigate back to the form detail page or a thank you page
        // setTimeout(() => this.router.navigate(['/forms', this.formId]), 2000);
        alert('Response submitted successfully!'); // Simple feedback
      },
      error: (err) => {
        console.error('Error submitting response:', err);
        this.submitError = err.message || 'Failed to submit response. Please try again.';
        this.isSubmitting = false;
      },
    });
  }

  // Optional: Add a retry method for loading
  retryLoad(): void {
    if (this.formId) {
      this.loadForm(this.formId);
    }
  }

  // Optional: Add a cancel method
  cancel(): void {
    // Navigate back or reset form
    if (this.formId) {
      this.router.navigate(['/forms', this.formId]); // Example: Go back to form detail
    } else {
      this.router.navigate(['/forms']); // Fallback
    }
  }
}
