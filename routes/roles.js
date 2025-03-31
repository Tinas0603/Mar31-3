var express = require('express');
var router = express.Router();
const roleSchema = require('../schemas/role');
let { check_authentication, check_authorization } = require("../utils/check_auth");

/* GET roles - no authentication required */
router.get('/', async function (req, res, next) {
  try {
    let roles = await roleSchema.find({});
    res.send({
      success: true,
      data: roles
    });
  } catch (error) {
    next(error);
  }
});

/* POST create role - admin only */
router.post('/', check_authentication, check_authorization(['admin']),
  async function (req, res, next) {
    try {
      let body = req.body;
      let newRole = new roleSchema({
        name: body.name
      });
      await newRole.save();
      res.status(200).send({
        success: true,
        data: newRole
      });
    } catch (error) {
      res.status(404).send({
        success: false,
        message: error.message
      });
    }
  });

module.exports = router;