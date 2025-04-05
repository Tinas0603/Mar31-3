const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        required: true,
        default: 0
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Menu',
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Menu', menuSchema);