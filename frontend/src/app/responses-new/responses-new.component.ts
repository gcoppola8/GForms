import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormService, Form, Question, FormResponse, NewFormResponse } from '../../services/gforms-backend.service'; // Adjust path if needed
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular'; // Import ClarityModule if using Clarity components
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-responses-new',
  imports: [CommonModule, ClarityModule,ReactiveFormsModule , RouterLink],
  standalone: true,
  providers: [FormService],
  templateUrl: './responses-new.component.html',
  styleUrl: './responses-new.component.css'
})
export class ResponsesNewComponent implements OnInit, OnDestroy {
  form: Form | null = null;
  formId: string | null = '';
  isLoading: boolean = true;
  error: string | null = null;

  QuestionsForm = new FormGroup({});

  private routeSub: Subscription | undefined;
  private formSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.formId = params.get('id');
      if (this.formId) {
        this.loadFormDetails(this.formId);
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
    this.QuestionsForm = new FormGroup({});

    this.formSub = this.formService.getFormById(id).subscribe({
      next: (data) => {
        this.form = data;
        this.isLoading = false;
        console.log('Form details loaded:', this.form);

        if (this.form?.questions) {
          this.form.questions.forEach(question => {
            this.QuestionsForm.addControl(question.id, new FormControl(''));
          });
        }
      },
      error: (err) => {
        console.error('Error loading form details:', err);
        this.error = err.message || 'Could not load form details.';
        this.isLoading = false;
      }
    });
  }

  sendResponse(): void {
    if (this.form?.questions === undefined || this.form?.questions.length === 0) {
      console.log('Form has no questions to submit.');
      return;
    }

    let nfr : NewFormResponse = {
      form_id: this.form!.id,
      respondent_user_id: "user-id-" + Math.floor(Math.random() * 1000000000000000) ,
      answers: [],
    };

    this.form!.questions.forEach(question => {
      nfr.answers?.push({
        question_id: question.id,
        value: String(this.QuestionsForm.get(question.id)?.value),
      });
    });

    // TODO: Fill the values in some way
    
    this.formService.submitFormResponse(this.form!.id, nfr).subscribe({
      next: (data) => {
        alert('Form response submitted successfully!');
        console.log('Form response submitted:', data);
        this.router.navigate(['/forms', this.form!.id]);

      },
      error: (err) => {
        console.error('Error submitting form response:', err);
      }
    });
    
  }
}
