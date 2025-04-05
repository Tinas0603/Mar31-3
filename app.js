var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productSchema = require('./schemas/product');
var categorySchema = require('./schemas/category');

var app = express();

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/S2';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/roles', require('./routes/roles'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));
app.use('/menu', require('./routes/menu'));
app.get('/api/:categoryslug', async (req, res, next) => {
  try {
    const category = await categorySchema.findOne({ slug: req.params.categoryslug });
    if (!category) {
      return res.status(404).send({
        success: false,
        message: 'Category not found'
      });
    }

    const products = await productSchema.find({ category: category._id })
      .populate('category', 'name slug');

    res.status(200).send({
      success: true,
      data: {
        category: {
          name: category.name,
          slug: category.slug
        },
        products: products
      }
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/:categoryslug/:productslug', async (req, res, next) => {
  try {
    const category = await categorySchema.findOne({ slug: req.params.categoryslug });
    if (!category) {
      return res.status(404).send({
        success: false,
        message: 'Category not found'
      });
    }

    const product = await productSchema.findOne({
      slug: req.params.productslug,
      category: category._id
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).send({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).send({
    success: false,
    message: err.message
  });
});

module.exports = app;