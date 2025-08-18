const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    business: String,
    message: String
}, { collection: 'details' });

module.exports = mongoose.model('Details', userSchema);