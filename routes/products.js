var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/product')
let categorySchema = require('../schemas/category')
let { check_authentication, check_authorization } = require("../utils/check_auth");

function BuildQuery(query) {
  let result = {};
  if (query.name) {
    result.name = new RegExp(query.name, 'i');
  }
  result.price = {};
  if (query.price) {
    if (query.price.$gte) {
      result.price.$gte = Number(query.price.$gte);
    } else {
      result.price.$gte = 0;
    }
    if (query.price.$lte) {
      result.price.$lte = Number(query.price.$lte);
    } else {
      result.price.$lte = 10000;
    }
  } else {
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  return result;
}

router.get('/', async function (req, res, next) {
  console.log(BuildQuery(req.query));
  let products = await productSchema.find(BuildQuery(req.query)).populate({
    path: 'category', select: 'name'
  })
  res.status(200).send({
    success: true,
    data: products
  });
});

router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let product = await productSchema.findById(id)
    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

router.post('/', check_authentication, check_authorization(['moderator', 'admin']),
  async function (req, res, next) {
    try {
      let body = req.body;
      let category = body.category;
      let getCategory = await categorySchema.findOne({
        name: category
      })
      if (getCategory) {
        let newProduct = new productSchema({
          name: body.name,
          slug: body.name.toLowerCase().replace(/ /g, '-'),
          price: body.price ? body.price : 0,
          quantity: body.quantity ? body.quantity : 0,
          category: getCategory._id,
        });
        await newProduct.save()
        res.status(200).send({
          success: true,
          data: newProduct
        });
      } else {
        res.status(404).send({
          success: false,
          message: "category sai"
        });
      }
    } catch (error) {
      res.status(404).send({
        success: false,
        message: error.message
      });
    }
  });

router.put('/:id', check_authentication, check_authorization(['moderator', 'admin']),
  async function (req, res, next) {
    try {
      let id = req.params.id;
      let product = await productSchema.findById(id);
      if (product) {
        let body = req.body;
        if (body.name) {
          product.name = body.name;
          product.slug = body.name.toLowerCase().replace(/ /g, '-');
        }
        if (body.price) {
          product.price = body.price;
        }
        if (body.quantity) {
          product.quantity = body.quantity;
        }
        if (body.category) {
          product.category = body.category;
        }
        await product.save()
        resਮ

        res.status(200).send({
          success: true,
          data: product
        });
      } else {
        res.status(404).send({
          success: false,
          message: "ID khomng ton tai"
        });
      }
    } catch (error) {
      res.status(404).send({
        success: false,
        message: error.message
      });
    }
  });

router.delete('/:id', check_authentication, check_authorization(['admin']),
  async function (req, res, next) {
    try {
      let id = req.params.id;
      let product = await productSchema.findById(id);
      if (product) {
        product.isDeleted = true
        await product.save()
        res.status(200).send({
          success: true,
          data: product
        });
      } else {
        res.status(404).send({
          success: false,
          message: "ID khomng ton tai"
        });
      }
    } catch (error) {
      res.status(404).send({
        success: false,
        message: error.message
      });
    }
  });

module.exports = router;