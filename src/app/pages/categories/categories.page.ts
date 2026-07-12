import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { categories } from '../../data/mocks';
import { DocumentStoreService } from '../../services/document-store.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [RouterLink, IonContent, IonIcon],
  templateUrl: './categories.page.html',
  styleUrl: './categories.page.scss',
})
export class CategoriesPage {
  readonly store = inject(DocumentStoreService);
  readonly categories = categories;
}
