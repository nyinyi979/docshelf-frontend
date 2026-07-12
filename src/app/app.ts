import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  arrowForwardOutline,
  bookmark,
  bookmarkOutline,
  bookOutline,
  cameraOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
  cloudUploadOutline,
  documentAttachOutline,
  documentOutline,
  documentsOutline,
  downloadOutline,
  eyeOutline,
  fileTrayFullOutline,
  folderOpenOutline,
  gridOutline,
  homeOutline,
  listOutline,
  logOutOutline,
  menuOutline,
  moonOutline,
  notificationsOutline,
  personOutline,
  pulseOutline,
  searchOutline,
  shareSocialOutline,
  statsChartOutline,
  sunnyOutline,
  trashOutline,
} from 'ionicons/icons';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, RouterOutlet],
  template: '<ion-app><router-outlet /></ion-app>',
})
export class App {
  readonly theme = inject(ThemeService);

  constructor() {
    addIcons({
      arrowBackOutline,
      arrowForwardOutline,
      bookmark,
      bookmarkOutline,
      bookOutline,
      cameraOutline,
      checkmarkCircleOutline,
      chevronBackOutline,
      chevronForwardOutline,
      closeOutline,
      cloudUploadOutline,
      documentAttachOutline,
      documentOutline,
      documentsOutline,
      downloadOutline,
      eyeOutline,
      fileTrayFullOutline,
      folderOpenOutline,
      gridOutline,
      homeOutline,
      listOutline,
      logOutOutline,
      menuOutline,
      moonOutline,
      notificationsOutline,
      personOutline,
      pulseOutline,
      searchOutline,
      shareSocialOutline,
      statsChartOutline,
      sunnyOutline,
      trashOutline,
    });
  }
}
