import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  arrowForwardOutline,
  bookmark,
  bookmarkOutline,
  bookOutline,
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
  notificationsOutline,
  personOutline,
  pulseOutline,
  searchOutline,
  shareSocialOutline,
  statsChartOutline,
  trashOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, RouterOutlet],
  template: '<ion-app><router-outlet /></ion-app>',
})
export class App {
  constructor() {
    addIcons({
      arrowBackOutline,
      arrowForwardOutline,
      bookmark,
      bookmarkOutline,
      bookOutline,
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
      notificationsOutline,
      personOutline,
      pulseOutline,
      searchOutline,
      shareSocialOutline,
      statsChartOutline,
      trashOutline,
    });
  }
}
