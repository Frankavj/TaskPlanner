const express = require('express');
const pg = require('pg');
const dbURI = "postgres://kqtgokmgwwiwlv:6eadab2bf3f619a6cbffdf551abd6d0469b1134ceda61ac432a9b090941bc610@ec2-54-75-235-28.eu-west-1.compute.amazonaws.com:5432/d9nba8lrkjpjeu"
    + "?ssl=true"; // for encryption
const connString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: connString });
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
router.post("/", async function (req, res, next) {
    let updata = req.body;

    let sql = "INSERT INTO lists (id, name, shared, owner) VALUES(DEFAULT, $1, $2, $3) RETURNING *";
    let values = [updata.listname, updata.shared, logindata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: `List created: ${updata.listname}` })
        } else {
            throw "List creation failed.";
        }
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

// endpoint - lists GET private ---------------------------
router.get('/private', async function (req, res, next) {

    let sql = "SELECT * FROM lists WHERE owner=$1 AND shared=$2";
    let values = [logindata.userid, 1];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response    
    } catch (err) {
        res.status(500).json(err); //send response    
    }

});

// endpoint - lists GET mypublic --------------------------
router.get('/public', async function (req, res, next) {

    let sql = "SELECT * FROM lists WHERE owner=$1 AND shared=$2";
    let values = [logindata.userid, 0];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response    
    } catch (err) {
        res.status(500).json(err); //send response    
    }

});

// endpoint - lists GET individual ------------------------
router.get('/individual', async function (req, res, next) {

    let sql = "SELECT * FROM lists WHERE owner=$1 AND shared=$2";
    let values = [logindata.userid, 2];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response    
    } catch (err) {
        res.status(500).json(err); //send response    
    }

});

// endpoint - lists GET allpublic -------------------------
router.get('/allpublic', async function (req, res, next) {

    let sql = "SELECT * FROM lists WHERE shared=$1";
    let values = [0];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response    
    } catch (err) {
        res.status(500).json(err); //send response    
    }

});

// endpoint - lists PUT --------------------------------- 
router.put('/:id', async function (req, res, next) {

    let updata = req.body;

    let sql = 'SELECT * FROM lists WHERE id = $1 AND owner = $2';
    let values = [req.params.id, logindata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length == 0) {
            res.status(400).json({ msg: "List doesn't exist" }); //send response 
        } else {
            sql = "UPDATE lists SET";

            // change list name
            if (!updata.update.localeCompare("name")) {
                sql = sql + ` name = $3`;
                values.push(updata.value);
            }
            // change public / private
            // if (!updata.update.localeCompare("email")) {
            //     sql = sql + ` email = $2`;
            //     values.push(updata.value);
            // }
            // change inidivual access - later

            sql = sql + ` WHERE id = $1 AND owner = $2`;

            try {
                await pool.query(sql, values);
                res.status(200).json({ msg: "Update OK" });
            } catch (err) {
                res.status(500).json(err);
            }
        }
    } catch (err) {
        res.status(500).json(err); //send error response 
    }

});

// export module ------------------------------------------
module.exports = router;