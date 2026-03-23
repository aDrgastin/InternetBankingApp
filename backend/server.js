import express from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import cors from 'cors'
import mysql2 from 'mysql2/promise'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
//import ejwt from 'express-jwt' // which to use???
import config from './config.js'

export const app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(config.__dirname, 'public', 'app')));
app.use(helmet());
//app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type', 'Authorization');
    next();
});
//const dbPool = config.dbPool;

const mainRouter = express.Router();
mainRouter.route('/').get((req, res) => {
    res.sendFile(path.join(path.dirname() + '/public/app/index.html'));
});
app.use('/', mainRouter);

//const authRouter = auth(); // export app const
//app.use('/auth', authRouter);

//const apiRouter = api();
//app.use('/api', apiRouter);

app.get((req, res) => {
    res.status(404).end('Page not found!');
});

app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}`));