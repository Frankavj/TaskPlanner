const express = require('express');
const cors = require('cors'); //when the clients aren't on the server
const app = express(); //server-app

let auth = require('./auth.js');
let user = require('./user.js');
let list = require('./list.js');

// middleware ------------------------------------
app.use(cors()); //allow all CORS requests
app.use(express.json()); //for extracting json in the request-body
app.use('/', express.static('client')); //for serving client files

app.use('/auth', auth);
app.use('/users', user);
app.use('/lists', list);


// start server -----------------------------------
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server listening on port 3000!');
});