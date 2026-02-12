const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');

dotenv.config();

const app = express();

// ✅ View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'sjmart_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter: 24 * 3600 // Only update session once per day
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

// ✅ Global variables for all views
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.cartCount = req.session.cartCount || 0;
    res.locals.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    res.locals.title = 'SJ Mart - Fresh Vegetables & Fruits';
    next();
});

// ✅ Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const adminRoutes = require('./routes/admin');

// ✅ Use routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/admin', adminRoutes);

// ✅ 404 handler
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// ✅ Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    
    res.status(500).render('error', {
        title: 'Something Went Wrong',
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Please try again later.',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

module.exports = app;
