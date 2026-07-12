import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonChip, IonContent, IonIcon } from '@ionic/angular/standalone';
import { DocumentCardComponent } from '../../components/document-card/document-card.component';
import { activityFeed, categories, currentUser } from '../../data/mocks';
import { DocumentStoreService } from '../../services/document-store.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, IonChip, IonContent, IonIcon, DocumentCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  readonly store = inject(DocumentStoreService);
  readonly currentUser = currentUser;
  readonly categories = categories;
  readonly activityFeed = activityFeed;
  readonly stats = [
    { label: 'Total Documents', value: '128', icon: 'documents-outline' },
    { label: 'My Bookmarks', value: '14', icon: 'bookmark-outline' },
    { label: 'Categories Followed', value: '6', icon: 'folder-open-outline' },
    { label: 'Recent Activity', value: '24', icon: 'activity-outline' },
  ];

  initials(name: string): string {
    return name === 'You'
      ? currentUser.initials
      : name
          .split(' ')
          .map((part) => part[0])
          .join('');
  }
}
