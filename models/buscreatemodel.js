const mongoose = require('mongoose');
const { Schema } = mongoose;


const BusCreateSChema = new Schema({
    BusName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 20,
        unique:true
    },
    BusType: {
        type: String,
        enum: ["Normal", 'AC', 'Ultra Luxury', "Sleeper"],
        required: true
    },
    BusNumber: {
        type: Number,
        required: true
    },
    BoardingPoint: {
        type: String,
        required: true,
        maxLength: 20
    },
    DroppingPoint: {
        type: String,
        required: true,
        maxLength: 20
    },
    Distance: {
        type: Number,
        required: true
    },
    totalseats: {
        type: Number,
        require: true,
        default: 40
    },
    AvailableSeats: {
        type: [Number],
        default: function(){
            return Array.from({length:this.totalseats},(_,i)=>i+1)
        },
        required:true
    },
    soldseats: {
        type: [Number],
        default: []
    },
    BusOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required:true
    },
    totalfare:{
        type:String,
        default:0,
        required:true
    },
    isAvailable:{
        type:Boolean,
        default:true,
        required:true
    }
},
    { timestamps: true }
)

const BusCreate = mongoose.model('buscreate', BusCreateSChema);
module.exports = BusCreate;