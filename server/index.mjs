import { createApp } from './app.mjs';
import { createDatabase } from './database.mjs';

const database = createDatabase();
const port = Number(process.env.PORT || 3000);
const server = createApp(database).listen(port, () => console.log(`CogniScan API listening on port ${port}.`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close(() => database.pool.end()));
}
