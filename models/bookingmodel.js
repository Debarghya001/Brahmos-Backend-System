const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookSchema = new Schema({
    userid: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    busid: {
        type: mongoose.Schema.ObjectId,
        ref: 'buscreate',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    busname: {
        type: String,
        required: true,
    },
    busnumber: {
        type: String,
        required: true,
    },
    seatnumber: {
        type: [Number],
        requiured: true
    },
    boardingpoint: {
        type: String,
        required: true
    },
    droppingpoint: {
        type: String,
        required: true
    },
    busowner: {
        type: String,
        required: true
    },
    totalfare: {
        type: String,
        default: 0,
        required: true
    },
    isVerified: {
        type: String,
        enum: ["pending", "verified", "cancelled"],
        default: "pending",
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now,
        required: true
    }
},
    { timestamps: Date }
)

const Booking = mongoose.model('booking', BookSchema);
module.exports = Booking;