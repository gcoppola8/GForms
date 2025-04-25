import { Routes } from '@angular/router';
import { FormDetailComponent } from './form-detail/form-detail.component';
import { FormsListComponent } from './forms-list/forms-list.component';
import { FormsNewComponent } from './forms-new/forms-new.component';
import { ResponsesViewComponent } from './responses-view/responses-view.component';
import { ResponsesNewComponent } from './responses-new/responses-new.component';

export const routes: Routes = [
    { path: 'forms', component: FormsListComponent },
    { path: 'forms/new', component: FormsNewComponent },
    { path: 'forms/:id', component: FormDetailComponent },
    { path: 'forms/:id/responses', component: ResponsesViewComponent },
    { path: 'forms/:id/respond', component: ResponsesNewComponent},

    { path: '', redirectTo: '/forms', pathMatch: 'full'}
];
