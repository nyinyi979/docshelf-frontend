# DocShelf — Ionic Angular + Tailwind

This project is an Ionic Angular recreation of the supplied React/Vite DocShelf frontend. It keeps the original feature-based organization and closely follows the React layout, design tokens, responsive behavior, light theme, and dark theme.

## UI stack

- Ionic Angular 8 for mobile-ready controls, dialogs, content areas, and Capacitor integration
- Angular standalone components, Angular Router, signals, and services
- Tailwind CSS for layout, spacing, typography, responsive states, sidebar behavior, and shared visual styling
- Small component SCSS files only where Ionic shadow parts or component-specific styling are required

## Included screens

- Login and register
- Fixed desktop sidebar matching the React project
- Collapsible desktop navigation
- Mobile slide-over sidebar with backdrop
- Persistent light/dark theme toggle
- Home dashboard
- Documents grid/list, filters, sorting, pagination, upload modal, delete, and bookmark actions
- Document details, preview controls, version history, sharing, visibility, and new-version modal
- Categories
- Bookmarks
- Search with persisted recent searches
- Notifications with read/unread state
- Profile and delete-account confirmation
- 404 page

## Structure

```text
src/app/
├── components/
│   ├── auth-layout/
│   ├── document-card/
│   └── upload-modal/
├── data/
│   └── mocks.ts
├── layouts/
│   └── app-shell/
├── models/
│   └── document.model.ts
├── pages/
│   ├── bookmarks/
│   ├── categories/
│   ├── document-details/
│   ├── documents/
│   ├── home/
│   ├── login/
│   ├── not-found/
│   ├── notifications/
│   ├── profile/
│   ├── register/
│   └── search/
└── services/
    ├── document-store.service.ts
    └── theme.service.ts
```

Tailwind is configured in `tailwind.config.js`, PostCSS is configured in `postcss.config.js`, and the shared light/dark tokens are in `src/styles.scss`.

## Run the web app

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Production build

```bash
npm run build
```

## Capacitor mobile setup

Android:

```bash
npm run build
npm run cap:add:android
npm run cap:sync
npx cap open android
```

iOS (requires macOS and Xcode):

```bash
npm run build
npm run cap:add:ios
npm run cap:sync
npx cap open ios
```

## Notes

The supplied React project uses mock data and simulated interactions rather than a backend. This conversion preserves that behavior. `DocumentStoreService` is the intended place to replace mock state with Angular `HttpClient` API calls later.
