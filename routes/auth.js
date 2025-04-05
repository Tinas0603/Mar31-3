var express = require('express');
var router = express.Router();
let userControllers = require('../controllers/users');
let { check_authentication } = require("../utils/check_auth");
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');

router.post('/login', async function (req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let userId = await userControllers.checkLogin(username, password); // Giả sử trả về user ID

        // Tạo token
        const token = jwt.sign({
            id: userId,
            expireIn: Date.now() + 3600 * 1000 // Hết hạn sau 1 giờ
        }, constants.SECRET_KEY);

        // Trả về token trong response
        res.status(200).send({
            success: true,
            data: {
                token: token, // Trả token rõ ràng
                userId: userId,
                expiresIn: 3600 // Thời gian hết hạn (giây)
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post('/signup', async function (req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email;
        let result = await userControllers.createAnUser(username, password, email, 'user');
        res.status(200).send({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

router.get('/me', check_authentication, async function (req, res, next) {
    try {
        res.send({
            success: true,
            data: req.user
        });
    } catch (error) {
        next(error);
    }
});

router.post('/changepassword', check_authentication, async function (req, res, next) {
    try {
        let oldpassword = req.body.oldpassword;
        let newpassword = req.body.newpassword;
        let user = await userControllers.changePassword(req.user, oldpassword, newpassword);
        res.send({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;