# CogniScan

CogniScan is an Expo and React Native prototype for cognitive activities and daily training. Activity scores describe performance on the included tasks. The app has no clinical interpretation or validated diagnostic thresholds.

## User flow

1. Sign in or register with email and password. Confirm your email when required by the project.
2. Choose accessibility options and text size. These preferences belong to the signed-in account.
3. Answer the health-history question.
   - **No known history.** Complete three background questions and the current-condition questions. The app assigns the full battery of 15 scored tests.
   - **History.** Select any applicable conditions and answer the history questions, then describe your current condition. Background and current answers increase the priority of the relevant domains. The app adds tests for those domains to a short core battery.
4. Memorize three words first, complete the intervening tasks, and enter the three words at the end. Each assessment attempt has its own prompt, results, and completion state.
5. View task and domain scores. Start the Training tab to play the recommended games. Completed games update daily training progress and streaks. A streak day requires six completed games or one each in memory, attention, executive function, and language.

The active assessment uses observed interactions. The earlier simulated speech assessment and fixed forecasts have been removed. Caregiver delivery and scam monitoring remain prototype areas.

## Run locally

Install Node.js 20.19.4 or newer, then run:

```sh
npm ci
cp -n .env.example .env
npm test
```

Link the existing Neon project from the repository root using the Neon CLI. The app expects the resulting database connection URI in the server-only `DATABASE_URL` environment variable. Configure `BETTER_AUTH_URL` to the API origin and generate a server-only `BETTER_AUTH_SECRET` of at least 32 characters. Expo uses only `EXPO_PUBLIC_COGNISCAN_API_URL`, which points to the API over HTTPS for production. Set `COGNISCAN_WEB_ORIGINS` to the exact browser origins allowed to call that API.

```sh
npm run db:migrate
npm run api
npm start
```

The API uses Better Auth with a dedicated `cogniscan` schema on Neon Postgres. Its progress and reminder queries derive the owner from the authenticated session. The revision check prevents silent overwrites across devices. The app keeps an encrypted native recovery copy. Web sessions stay in memory. Configure email verification and recovery before offering public sign-ups. Existing Firebase accounts and records still require a separate, identity-verified migration.

Each other app should use its own database and least-privilege role, or a separate Neon project when stronger isolation is needed. Deploy the API on an HTTPS host for access outside your local development environment. The server opens database connections when needed and discards idle pool connections.

To serve the Expo web app and API from one origin, build with `npm run build:web` and set `COGNISCAN_SERVE_WEB=1` on the API host. The web app uses the current HTTPS origin by default. Native builds still need `EXPO_PUBLIC_COGNISCAN_API_URL`. On Render, the API uses `RENDER_EXTERNAL_URL` unless `BETTER_AUTH_URL` is set explicitly. Check `/health` to verify the API can reach the CogniScan schema.

## Android training reminders

1. In Firebase, register an Android app for `com.sid194506.CogniScan` and enable Firebase Cloud Messaging HTTP v1.
2. Set `GOOGLE_SERVICES_JSON` to the path of the Android Firebase config in your build environment and build an Android development or release app.
3. Set `FCM_SERVICE_ACCOUNT_JSON` and `TRAINING_CRON_SECRET` on the CogniScan API as server secrets.
4. Schedule an HTTPS POST to `/internal/training-reminders` every 15 minutes with `Authorization: Bearer <TRAINING_CRON_SECRET>`. The function sends a generic reminder during the 7 pm hour in the registered timezone and records the delivery attempt for that day.
5. On a physical Android device, sign in, enable Training Reminder in Privacy Settings, and confirm receipt. iOS and web push require additional platform integration.

## Verification

```sh
npm test
npx expo export --platform all
```

The tests exercise both assessment plans, delayed recall, score handling, training selection, and streak continuity. Use two test accounts to verify cross-account isolation on a deployed project. Use synthetic data when testing the app and reports.
