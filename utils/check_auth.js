let jwt = require('jsonwebtoken');
let constants = require('./constants');
var userControllers = require('../controllers/users');

module.exports = {
    check_authentication: async function (req, res, next) {
        try {
            if (!req.headers || !req.headers.authorization) {
                return res.status(401).send({
                    success: false,
                    message: "Bạn chưa đăng nhập. Vui lòng cung cấp token trong header Authorization."
                });
            }
            if (!req.headers.authorization.startsWith("Bearer ")) {
                return res.status(401).send({
                    success: false,
                    message: "Token không đúng định dạng. Sử dụng Bearer <token>."
                });
            }

            let token = req.headers.authorization.split(" ")[1];
            let decoded = jwt.verify(token, constants.SECRET_KEY);
            let user = await userControllers.getUserById(decoded.id);

            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: "Người dùng không tồn tại."
                });
            }

            if (decoded.expireIn < Date.now()) {
                return res.status(401).send({
                    success: false,
                    message: "Token đã hết hạn. Vui lòng đăng nhập lại."
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).send({
                success: false,
                message: `Xác thực thất bại: ${error.message}`
            });
        }
    },
    check_authorization: function (roles) {
        return function (req, res, next) {
            let roleOfUser = req.user.role.name;
            if (roles.includes(roleOfUser)) {
                next();
            } else {
                res.status(403).send({
                    success: false,
                    message: "Bạn không có quyền truy cập."
                });
            }
        };
    }
};