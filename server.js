const express = require('express');
const cors = require('cors'); //when the clients aren't on the server
const app = express(); //server-app
const pg = require('pg');
const dbURI = "postgres://kqtgokmgwwiwlv:6eadab2bf3f619a6cbffdf551abd6d0469b1134ceda61ac432a9b090941bc610@ec2-54-75-235-28.eu-west-1.compute.amazonaws.com:5432/d9nba8lrkjpjeu"
    + "?ssl=true"; // for encryption
const connString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({connectionString: connString });
const bcrypt = require('bcrypt');
const secret = "frenchfriestastegood!"; // for tokens = should be store as an environment variable;
const jwt = require('jsonwebtoken');

// middleware ------------------------------------
app.use(cors()); //allow all CORS requests
app.use(express.json()); //for extracting json in the request-body
app.use('/', express.static('client')); //for serving client files

// endpoint - users POST ---------------------------------
app.post("/users", async function(req, res, next) {
    let updata = req.body;

    // hash the pwd before it is stored in the db
    let hash = bcrypt.hashSync(updata.password, 10);

    let sql = "INSERT INTO users (id, username, email, pwdhash) VALUES(DEFAULT, $1, $2, $3) RETURNING *";
    let values = [updata.username, updata.email, hash];

    try {
        let result = await pool.query(sql, values);

        if(result.rows.length > 0) {
            res.status(200).json({msg: `User created: ${updata.username}`})
        } else {
            throw "User creation failed.";
        }
    } catch (err) {
        res.status(500).json({error: err});
    }
});

// start server -----------------------------------
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server listening on port 3000!');
});