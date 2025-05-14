import { Component, inject, OnInit, OnDestroy } from '@angular/core';
// Assicurati di importare il tipo FormResponse se definito nel servizio
import { FormService, FormResponse } from '../../services/gforms-backend.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
// Importa gli operatori e i tipi RxJS necessari
import { Subscription, timer, Subject, EMPTY } from 'rxjs';
import { switchMap, takeUntil, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-responses-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './responses-view.component.html',
  styleUrls: ['./responses-view.component.css'] // Corretto da styleUrl a styleUrls
})
export class ResponsesViewComponent implements OnInit, OnDestroy {
  private formService = inject(FormService);
  private route = inject(ActivatedRoute);

  formId: string | null = null;
  // Usa il tipo specifico FormResponse[] invece di any[] per maggiore sicurezza
  responses: FormResponse[] = [];
  isLoading = true; // Indica il caricamento iniziale
  error: string | null = null; // Errore durante il caricamento iniziale
  pollingError: string | null = null; // Errore specifico per il polling

  // Intervallo di polling in millisecondi (es. 15 secondi)
  private readonly pollingInterval = 5000;
  // Subject per notificare la distruzione del componente e fermare il polling
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.formId = this.route.snapshot.paramMap.get('id');

    if (this.formId) {
      // Carica le risposte iniziali
      this.loadInitialResponses(this.formId);
      // Imposta il polling per aggiornamenti periodici
      this.setupPolling(this.formId);
    } else {
      console.error('Form ID not found in route parameters!');
      this.error = 'Could not determine the form ID from the URL.';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    // Notifica la distruzione per fermare gli observable in corso (come il polling)
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carica le risposte la prima volta, gestendo lo stato isLoading.
   */
  loadInitialResponses(formId: string): void {
    this.isLoading = true;
    this.error = null;
    this.pollingError = null; // Resetta anche l'errore di polling
    this.formService.getFormResponses(formId).subscribe({
      next: (data) => {
        this.responses = data;
        this.isLoading = false; // Caricamento iniziale completato
        console.log(`Initial responses for form ${formId}:`, this.responses);
      },
      error: (err) => {
        console.error(`Error loading initial responses for form ${formId}:`, err);
        // Usa il messaggio di errore fornito dal servizio, se disponibile
        this.error = err.message || 'Could not load initial responses for this form.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Imposta un intervallo che recupera periodicamente le risposte.
   */
  setupPolling(formId: string): void {
    timer(this.pollingInterval, this.pollingInterval) // Emetti dopo l'intervallo iniziale, poi ripeti
      .pipe(
        // switchMap annulla la richiesta precedente se ne arriva una nuova
        switchMap(() => {
          console.log(`Polling for responses for form ${formId}...`);
          // Resetta l'errore di polling prima di ogni tentativo
          this.pollingError = null;
          return this.formService.getFormResponses(formId).pipe(
            catchError(err => {
              // Gestisce gli errori durante il polling senza fermare l'intervallo
              console.error(`Error during polling for form ${formId}:`, err);
              this.pollingError = err.message || 'Failed to update responses during polling.';
              // Ritorna un observable vuoto per permettere al timer di continuare
              return EMPTY; // EMPTY è un observable che completa subito senza emettere valori
            })
          );
        }),
        // takeUntil ferma il polling quando destroy$ emette un valore (in ngOnDestroy)
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          // Aggiorna le risposte solo se la richiesta ha avuto successo
          // (catchError ritorna EMPTY in caso di errore, quindi 'next' non viene chiamato)
          this.responses = data;
          console.log(`Updated responses via polling for form ${formId}:`, this.responses);
        }
      });
  }

  /**
   * Funzione opzionale per permettere all'utente di ritentare il caricamento iniziale.
   */
  retryInitialLoad(): void {
    if (this.formId) {
      this.loadInitialResponses(this.formId);
      // Non è necessario richiamare setupPolling qui, è già attivo se l'inizializzazione è andata a buon fine la prima volta
    }
  }
}
