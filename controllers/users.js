let userSchema = require('../schemas/user');
let roleSchema = require('../schemas/role');
let bcrypt = require('bcrypt');

module.exports = {
    getAllUsers: async function () {
        return userSchema.find({});
    },
    getUserById: async function (id) {
        return userSchema.findById(id).populate('role');
    },
    getUserByUsername: async function (username) {
        return userSchema.findOne({ username: username });
    },
    createAnUser: async function (username, password, email, roleI) {
        let role = await roleSchema.findOne({ name: roleI });
        if (!role) {
            throw new Error('Role không tồn tại');
        }

        // Mã hóa mật khẩu trước khi lưu
        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser = new userSchema({
            username: username,
            password: hashedPassword, // Lưu mật khẩu đã mã hóa
            email: email,
            role: role._id
        });
        return await newUser.save();
    },
    updateAnUser: async function (id, body) {
        let updatedUser = await this.getUserById(id);
        let allowFields = ["password", "email"];
        for (const key of Object.keys(body)) {
            if (allowFields.includes(key)) {
                if (key === "password") {
                    // Mã hóa mật khẩu nếu cập nhật
                    updatedUser[key] = await bcrypt.hash(body[key], 10);
                } else {
                    updatedUser[key] = body[key];
                }
            }
        }
        await updatedUser.save();
        return updatedUser;
    },
    deleteAnUser: async function (id) {
        let updatedUser = await userSchema.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        );
        return updatedUser;
    },
    checkLogin: async function (username, password) {
        let user = await this.getUserByUsername(username);
        if (!user) {
            throw new Error("Username không tồn tại");
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Mật khẩu không đúng");
        }

        return user._id; // Trả về userId nếu thành công
    },
    changePassword: async function (user, oldpassword, newpassword) {
        // So sánh mật khẩu cũ
        const isMatch = await bcrypt.compare(oldpassword, user.password);
        if (!isMatch) {
            throw new Error("Mật khẩu cũ không đúng");
        }

        // Mã hóa mật khẩu mới trước khi lưu
        user.password = await bcrypt.hash(newpassword, 10);
        return await user.save();
    }
};