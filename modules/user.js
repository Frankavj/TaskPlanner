// Import dbURI -------------------------------------------------------------------------------------
const { dbURI } = require('../dbURI');

const express = require('express');
const pg = require('pg');
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

    if (req.method.localeCompare("POST") == 0) {
        next();
        return;
    }

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

// endpoint - users POST ---------------------------------
router.post("/", async function (req, res, next) {
    let updata = req.body;

    // hash the pwd before it is stored in the db
    let hash = updata.password ? crypto.createHash('sha256').update(updata.password).digest('hex') : null;

    let sql = "INSERT INTO users (id, username, email, pwdhash) VALUES(DEFAULT, $1, $2, $3) RETURNING *";
    let values = [updata.username, updata.email, hash];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: `User created: ${updata.username}` })
        } else {
            throw "User creation failed.";
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// endpoint - users GET --------------------------------- 
router.get('/', async function (req, res, next) {

    let sql = "SELECT * FROM users WHERE id=$1";
    let values = [logindata.userid];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows[0]); //send response    
    } catch (err) {
        res.status(500).json(err); //send response    
    }

});

// endpoint - users GET by id --------------------------- 
router.get('/id/:id', async function (req, res, next) {

    let sql = "SELECT * FROM users WHERE id=$1";
    let values = [req.params.id];

    try {
        let result = await pool.query(sql, values);
        if (result.rows.length == 0) {
            res.status(400).json({ msg: "User doesn't exist" }); //send response 
        } else {
            res.status(200).json(result.rows[0]); //send response    
        }
    } catch (err) {
        res.status(500).json(err); //send response    
    }

});

// endpoint - users GET by username --------------------- 
router.get('/username/:username', async function (req, res, next) {

    let sql = "SELECT * FROM users WHERE username=$1";
    let values = [req.params.username];

    try {
        let result = await pool.query(sql, values);
        if (result.rows.length == 0) {
            res.status(400).json({ msg: "User doesn't exist" }); //send response 
        } else {
            res.status(200).json(result.rows[0]); //send response    
        }
    } catch (err) {
        res.status(500).json(err); //send response    
    }

});

// endpoint - users GET by email ------------------------ 
router.get('/email/:email', async function (req, res, next) {

    let sql = "SELECT * FROM users WHERE email=$1";
    let values = [req.params.email];

    try {
        let result = await pool.query(sql, values);
        if (result.rows.length == 0) {
            res.status(400).json({ msg: "User doesn't exist" }); //send response 
        } else {
            res.status(200).json(result.rows[0]); //send response    
        }
    } catch (err) {
        res.status(500).json(err); //send response    
    }

});

// endpoint - users PUT --------------------------------- 
router.put('/', async function (req, res, next) {

    let updata = req.body;

    let sql = 'SELECT * FROM users WHERE id = $1';
    let values = [logindata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length == 0) {
            res.status(400).json({ msg: "User doesn't exist" }); //send response 
        } else {
            // can only change user data if the old password is correct
            let hashedInput = crypto.createHash('sha256').update(updata.oldpass).digest('hex');

            if (hashedInput == result.rows[0].pwdhash) {
                // don't do anything if value is null
                if (!updata.value) {
                    res.status(400).json({ msg: "No new user data" });
                } else {
                    sql = "UPDATE users SET";

                    // change username
                    if (!updata.update.localeCompare("username")) {
                        sql = sql + ` username = $2`;
                        values.push(updata.value);
                    }
                    // change email
                    if (!updata.update.localeCompare("email")) {
                        sql = sql + ` email = $2`;
                        values.push(updata.value);
                    }
                    // change password
                    if (!updata.update.localeCompare("password")) {
                        let hash = crypto.createHash('sha256').update(updata.value).digest('hex');
                        sql = sql + ` pwdhash = $2`;
                        values.push(hash);
                    }
                    // change avatar
                    if (!updata.update.localeCompare("avatar")) {
                        sql = sql + ` avatar = $2`;
                        values.push(updata.value);
                    }

                    sql = sql + ` WHERE id = $1`;

                    try {
                        await pool.query(sql, values);
                        res.status(200).json({ msg: "Update OK" });
                    } catch (err) {
                        res.status(500).json(err);
                    }

                }
            } else {
                res.status(400).json({ msg: "Wrong password" });
            }
        }
    } catch (err) {
        res.status(500).json(err); //send error response 
    }

});

// endpoint - users PUT avatar ---------------------------- 
router.put('/avatar', async function (req, res, next) {
    let updata = req.body;

    let sql = 'SELECT * FROM users WHERE id = $1';
    let values = [logindata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length == 0) {
            res.status(400).json({ msg: "User doesn't exist" }); //send response 
        } else {
            sql = "UPDATE users SET avatar = $2 WHERE id = $1";
            values.push(updata.value);

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

// endpoint - users DELETE --------------------------------- 
router.delete('/', async function (req, res, next) {

    let updata = req.body;

    let sql = 'DELETE FROM users WHERE id = $1 RETURNING *'
    let values = [updata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: "Delete OK" }); //send response 
        }
        else {
            throw "Delete failed"
        }
    } catch (err) {
        res.status(500).json({ error: err }); //send error response 
    }

});

// export module ------------------------------------------
module.exports = router;

