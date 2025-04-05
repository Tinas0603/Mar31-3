const express = require('express');
const router = express.Router();
const menuSchema = require('../schemas/menu');
const { check_authentication, check_authorization } = require("../utils/check_auth");

router.get('/', async function (req, res, next) {
    try {
        const menus = await menuSchema.find({ isDeleted: false })
            .populate('parent', 'text url');
        res.status(200).send({
            success: true,
            data: menus
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

router.get('/:id', async function (req, res, next) {
    try {
        const menu = await menuSchema.findOne({ _id: req.params.id, isDeleted: false })
            .populate('parent', 'text url');
        if (!menu) {
            return res.status(404).send({
                success: false,
                message: "Menu not found"
            });
        }
        res.status(200).send({
            success: true,
            data: menu
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

router.post('/', check_authentication, check_authorization(['moderator', 'admin']),
    async function (req, res, next) {
        try {
            const { text, url, order, parent } = req.body;

            if (parent) {
                const parentMenu = await menuSchema.findById(parent);
                if (!parentMenu || parentMenu.isDeleted) {
                    return res.status(400).send({
                        success: false,
                        message: "Parent menu not found or deleted"
                    });
                }
            }

            const newMenu = new menuSchema({
                text,
                url,
                order: order || 0,
                parent: parent || null
            });

            await newMenu.save();
            res.status(201).send({
                success: true,
                data: newMenu
            });
        } catch (error) {
            res.status(400).send({
                success: false,
                message: error.message
            });
        }
    }
);

router.put('/:id', check_authentication, check_authorization(['moderator', 'admin']),
    async function (req, res, next) {
        try {
            const menu = await menuSchema.findOne({ _id: req.params.id, isDeleted: false });
            if (!menu) {
                return res.status(404).send({
                    success: false,
                    message: "Menu not found"
                });
            }

            const { text, url, order, parent } = req.body;

            // Kiểm tra parent nếu được cập nhật
            if (parent && parent !== menu.parent?.toString()) {
                const parentMenu = await menuSchema.findById(parent);
                if (!parentMenu || parentMenu.isDeleted) {
                    return res.status(400).send({
                        success: false,
                        message: "Parent menu not found or deleted"
                    });
                }
                if (parent === req.params.id) {
                    return res.status(400).send({
                        success: false,
                        message: "A menu cannot be its own parent"
                    });
                }
            }

            if (text) menu.text = text;
            if (url) menu.url = url;
            if (order !== undefined) menu.order = order;
            if (parent !== undefined) menu.parent = parent || null;

            await menu.save();
            res.status(200).send({
                success: true,
                data: menu
            });
        } catch (error) {
            res.status(400).send({
                success: false,
                message: error.message
            });
        }
    }
);

router.delete('/:id', check_authentication, check_authorization(['admin']),
    async function (req, res, next) {
        try {
            const menu = await menuSchema.findOne({ _id: req.params.id, isDeleted: false });
            if (!menu) {
                return res.status(404).send({
                    success: false,
                    message: "Menu not found"
                });
            }

            menu.isDeleted = true;
            await menu.save();

            await menuSchema.updateMany({ parent: menu._id }, { $set: { parent: null } });

            res.status(200).send({
                success: true,
                data: menu
            });
        } catch (error) {
            res.status(500).send({
                success: false,
                message: error.message
            });
        }
    }
);

module.exports = router;