# CogniScan

CogniScan is an Expo and React Native prototype for cognitive activities and daily training. Activity scores describe performance on the included tasks. The app has no clinical interpretation or validated diagnostic thresholds.

## User flow

1. Sign in or register with Supabase Auth. Confirm your email when required by the project.
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
cp .env.example .env
npm test
npm start
```

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the CogniScan project. Enable the Email auth provider and set the confirmation-link site URL to a page you control. Apply the migration in `supabase/migrations` to that project before signing in.

Supabase Auth identifies accounts by UID. PostgreSQL row-level security isolates progress and reminder devices. The app uses a revision check to avoid overwriting changes from another device and keeps an encrypted local recovery copy on native platforms. Web sessions live in memory and require an online sign-in on a new page load. Progress deletion removes the active Supabase record and current app cache. Older Firebase accounts and local records require a separate, identity-verified migration.

## Android training reminders

1. In Firebase, register an Android app for `com.sid194506.CogniScan` and enable Firebase Cloud Messaging HTTP v1.
2. Set `GOOGLE_SERVICES_JSON` to the path of the Android Firebase config in your build environment and build an Android development or release app.
3. Deploy the Supabase `send-training-reminders` Edge Function using the repository's function config. Set `FCM_SERVICE_ACCOUNT_JSON` and `TRAINING_CRON_SECRET` as server secrets. Keep the service account and scheduler secret out of client config and Git.
4. Schedule an HTTPS POST every 15 minutes with `Authorization: Bearer <TRAINING_CRON_SECRET>`. The function sends a generic reminder during the 7 pm hour in the registered timezone and records the delivery attempt for that day.
5. On a physical Android device, sign in, enable Training Reminder in Privacy Settings, and confirm receipt. iOS and web push require additional platform integration.

## Verification

```sh
npm test
npx expo export --platform all
```

The tests exercise both assessment plans, delayed recall, score handling, training selection, and streak continuity. Use two test accounts to verify cross-account isolation on a deployed project. Use synthetic data when testing the app and reports.
