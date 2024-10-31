const mongoose = require('mongoose');
const { Schema } = mongoose;


const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phonenumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxLength: 10,
        minLength: 10
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Admin", "Client"],
        default: "Client",
        required: true
    }
},
    {
        timestamps: Date
    }
)

const User = mongoose.model("user", UserSchema);
module.exports = User