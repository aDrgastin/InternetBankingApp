import express from 'express'
//import 'dotenv/config'
import morgan from 'morgan'
import path from 'path'
import helmet from 'helmet'
import cors from 'cors'
import config from './config.js'
import authRoutes from './app/routes/authRoutes.js'
import transactionRoutes from './app/routes/transactionRoutes.js'
import accountRoutes from './app/routes/accountRoutes.js'
import cardRoutes from './app/routes/cardRoutes.js'
import auditRoutes from './app/routes/auditRoutes.js'

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet({
    contentSecurityPolicy: false
}));
//app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

const mainRouter = express.Router();
mainRouter.route('/').get((req, res) => {
    res.sendFile(path.join(config.__dirname, 'public', 'app', 'index.html'))
});
app.use('/', mainRouter);

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/audit', auditRoutes);

app.use(express.static(path.join(config.__dirname, 'public', 'app')));

app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(config.__dirname, 'public', 'app', 'index.html'));
});

app.use((req, res) => {
    res.status(404).end('Page not found!');
});

app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}`));
