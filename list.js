const express = require('express');
const pg = require('pg');
const dbURI = "postgres://kqtgokmgwwiwlv:6eadab2bf3f619a6cbffdf551abd6d0469b1134ceda61ac432a9b090941bc610@ec2-54-75-235-28.eu-west-1.compute.amazonaws.com:5432/d9nba8lrkjpjeu"
    + "?ssl=true"; // for encryption
const connString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({connectionString: connString });
const crypto = require('crypto');
const secret = "stroopwafelstastegood!"; // for tokens = should be store as an environment variable;
const jwt = require('jsonwebtoken');

const router = express.Router();

let logindata;

// middleware ------------------------------------
router.use('/', function (req, res, next) {
    let token = req.headers['authorisation'];

    if (token) {
        try {
            logindata = jwt.verify(token, secret);
            next();
        } catch (err) {
            res.status(403).json({ msg: "Not a valid token" });
        }
    } else {
        res.status(403).json({ msg: "No token" });
    }
});

// endpoint - lists POST ---------------------------------
router.post("/", async function(req, res, next) {
    let updata = req.body;

    let sql = "INSERT INTO lists (id, name, shared, owner, individual_access) VALUES(DEFAULT, $1, $2, $3, $4) RETURNING *";
    let values = [updata.listname, updata.shared, updata.owner, updata.hasaccess];

    try {
        let result = await pool.query(sql, values);

        if(result.rows.length > 0) {
            res.status(200).json({msg: `List created: ${updata.name}`})
        } else {
            throw "List creation failed.";
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

// endpoint - list GET ------------------------------------
router.get('/', async function (req, res, next) {

    // uncomment once we have authentication
let sql = "SELECT * FROM users WHERE id=$1";
let values = [logindata.userid];

try {
    let result = await pool.query(sql, values);
    res.status(200).json(result.rows[0]); //send response    
} catch (err) {
    res.status(500).json(err); //send response    
}

});

// export module ------------------------------------------
module.exports = router;