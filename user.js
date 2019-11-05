const express = require('express');
const pg = require('pg');
const dbURI = "postgres://kqtgokmgwwiwlv:6eadab2bf3f619a6cbffdf551abd6d0469b1134ceda61ac432a9b090941bc610@ec2-54-75-235-28.eu-west-1.compute.amazonaws.com:5432/d9nba8lrkjpjeu"
    + "?ssl=true"; // for encryption
const connString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: connString });
const crypto = require('crypto');
const secret = "frenchfriestastegood!"; // for tokens = should be store as an environment variable;
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
    let hash = crypto.createHash('sha256').update(updata.password).digest('hex');

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
        res.status(500).json({ error: err });
    }
});

// endpoint - users GET --------------------------------- 
router.get('/', async function (req, res, next) {

    // uncomment once we have authentication
    let sql = "SELECT * FROM users WHERE id=$1";
    let values = [logindata.userid];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response    
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
                // user didn't fill in any of the fields
                if (!updata.username && !updata.email && !updata.newpass) {
                    res.status(400).json({ msg: "No new user data" });
                } else {
                    sql = "UPDATE users SET";
                    let needComma = false;
                    let index = 2;

                    // change username
                    if (updata.username) {
                        sql = sql + ` username = $${index}`;
                        values.push(updata.username);
                        needComma = true;
                        index++;
                    }
                    // change email
                    if (updata.email) {
                        if(needComma) {
                            sql = sql + ",";
                        } else {
                            needComma = true;
                        }
                        sql = sql + ` email = $${index}`;
                        values.push(updata.email);
                        index++;
                    }
                    // change password
                    if (updata.newpass) {
                        if(needComma) {
                            sql = sql + ",";
                        } else {
                            needComma = true;
                        }
                        let hash = crypto.createHash('sha256').update(updata.newpass).digest('hex');
                        sql = sql + ` pwdhash = $${index}`;
                        values.push(hash);
                    }

                    sql = sql + ` WHERE id = $1`;

                    try {
                        await pool.query(sql, values);
                        res.status(200).json({msg: "Update OK"});
                    } catch (err) {
                        res.status(500).json({ error: err });
                    }

                }
            } else {
                res.status(400).json({ msg: "Wrong password" });
            }
        }
    } catch (err) {
        res.status(500).json({ error: err }); //send error response 
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