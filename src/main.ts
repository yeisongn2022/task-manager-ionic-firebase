import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { importProvidersFrom } from '@angular/core';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { AppRoutingModule } from './app/app-routing.module';

// FIREBASE
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
// Añadimos Remote Config
import { provideRemoteConfig, getRemoteConfig } from '@angular/fire/remote-config';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(
      IonicModule.forRoot({}), 
      AppRoutingModule 
    ),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    // Configuración de Remote Config
    provideRemoteConfig(() => {
      const rc = getRemoteConfig();
      // Tiempo mínimo para refrescar valores (en milisegundos)
      rc.settings.minimumFetchIntervalMillis = 0; 
      return rc;
    }),
  ],
});
