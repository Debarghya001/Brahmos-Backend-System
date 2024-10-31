const { ServerApiVersion } = require('mongodb')
const mongoose = require('mongoose')


module.exports = async () => {
    const options = {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
    try {
        await mongoose.connect(process.env.DB_URI, options);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged deployment!! Successfully connected to MongoDB");
    } catch (error) {
        await mongoose.disconnect();
        console.log(`Error connecting to database! ${error}`)
    }
}