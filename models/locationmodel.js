const mongoose = require('mongoose');
const { Schema } = mongoose;

const LocationSchema = new Schema({
    name: {
        type: String,
        unique: true
    }
})

const Location = mongoose.model('location', LocationSchema);
module.exports = Location;
