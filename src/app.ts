import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './features/auth/auth.routes.js';
import gearRoutes from './features/gear/gear.routes.js';
import { listCategories } from './features/gear/gear.controller.js';
import rentalRoutes from './features/rental/rental.routes.js';
import paymentRoutes from './features/payment/payment.routes.js';
import providerRoutes from './features/provider/provider.routes.js';
import reviewRoutes from './features/review/review.routes.js';
import adminRoutes from './features/admin/admin.routes.js';
import { RawBodyRequest } from './types/index.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(cookieParser());

app.use(express.json({
  limit: '10kb',
  verify: (req: RawBodyRequest, _res, buf) => { req.rawBody = buf; },
}));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/gear', gearRoutes);
app.get('/api/categories', listCategories);
app.use('/api/rentals', rentalRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.all('/{*path}', (_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;
