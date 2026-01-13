require('dotenv').config();

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const machineRoutes = require('./routes/machines');
const complaintRoutes = require('./routes/complaints');
const leaveRoutes = require('./routes/leaves');
const workTimeRoutes = require('./routes/workTime');
const uploadRoutes = require('./routes/uploads');
const messageRoutes = require('./routes/messages');
const skillRoutes = require('./routes/skills');
const serviceHistoryRoutes = require('./routes/serviceHistory');
const checklistRoutes = require('./routes/checklists');
const duplicateRoutes = require('./routes/duplicates');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const systemRoutes = require('./routes/system');
const securityRoutes = require('./routes/security');
const apiLogger = require('./middleware/apiLogger');
const maintenanceMode = require('./middleware/maintenanceMode');
const { validateFrontendRequest } = require('./middleware/frontendValidation');
const { securityHeaders, standardLimiter, loginLimiter } = require('./middleware/security');
const { validateCSRF, checkSessionIntegrity, loadCurrentUser } = require('./middleware/auth');

const app = express();

// Allow CORS from known origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(compression());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(securityHeaders);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if(process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1'){
  app.set('trust proxy', 1);
}

// Initialize API keys if any
try{ require('./middleware/security').initializeAPIKeys(); }catch(e){}

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), { maxAge: '1d' }));

// Apply global rate limiter
app.use(standardLimiter);

// sessions (SequelizeStore used when available)
const store = new SequelizeStore({ db: sequelize });
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax'
  }
}));

// API middleware chain
app.use('/api', apiLogger);
app.use('/api', validateFrontendRequest);
app.use('/api', loadCurrentUser);
app.use('/api', checkSessionIntegrity);
app.use('/api', maintenanceMode);
app.use('/api', validateCSRF);

// routes
app.use('/api/security', securityRoutes);
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/work-time', workTimeRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/service-history', serviceHistoryRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/duplicates', duplicateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/system', systemRoutes);

app.get('/', (req, res) => res.json({ ok: true }));

// Export both app and session store (store is used during startup sync)
module.exports = {
  app,
  store
};
