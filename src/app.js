import express from 'express';
import mustacheExpress from 'mustache-express';
import bodyParser from 'body-parser';

import router from './router.js';
import { defaultModel } from './defaultModel.js';
import { connectDatabase, closeDatabase } from './albums.js';
import { initializeDemoData } from './seed.js';
import { UPLOADS_FOLDER } from './uploads.js';

const app = express();

app.use(express.static('./public'));
app.use('/uploads', express.static(UPLOADS_FOLDER));

app.set('view engine', 'html');
app.engine('html', mustacheExpress(), ".html");
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(defaultModel);
app.use('/', router);

try {
    await connectDatabase();
    await initializeDemoData();
    app.listen(3000, () => console.log('Web ready in http://localhost:3000/'));
} catch (error) {
    console.error('Application startup failed:', error.message);
    await closeDatabase();
    process.exitCode = 1;
}
