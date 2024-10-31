const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const connection = require('./configuration/database');
const cookieparser = require('cookie-parser');

dotenv.config({ path: "./configuration/.env" });

const port = process.env.PORT || 8080

app.use(express.json());

app.use(cors)
app.use(cookieparser());



connection();

app.use('/api/auth', require('./controller/usercontroller'));
app.use('/api/busregister', require('./controller/buscontroller'));
app.use('/api/busbooking', require('./controller/booking'));
app.use('/api/location', require('./controller/location'));


app.listen(port, () => {
  console.log(`Server connected to port ${port}, http://localhost:${port}`)
})