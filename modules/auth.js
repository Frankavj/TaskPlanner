// Import dbURI -------------------------------------------------------------------------------------
const { dbURI } = require('../dbURI');

const express = require('express');
const pg = require('pg');
const connString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({connectionString: connString });
const crypto = require('crypto');
const secret = "stroopwafelstastegood!"; // for tokens = should be store as an environment variable;
const jwt = require('jsonwebtoken');

const router = express.Router();

// endpoint - auth (login) POST ---------------------------------
router.post('/', async function (req, res) {

    let updata = req.body // the data sent from the client

    // get the user from the db
    let sql = "SELECT * FROM users WHERE username = $1";
    let values = [updata.uname];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length == 0) {
            res.status(400).json({ msg: "User doesn't exist" }); //send response 
        } else {
            let hashedInput = crypto.createHash('sha256').update(updata.password).digest('hex');

            if (hashedInput == result.rows[0].pwdhash) {
                let payload = { userid: result.rows[0].id };
                let tok = jwt.sign(payload, secret, { expiresIn: "12h" }); // create token
                res.status(200).json({ username: result.rows[0].username, email: result.rows[0].email, userid: result.rows[0].id, avatar: result.rows[0].avatar, token: tok });
            } else {
                res.status(400).json({ msg: "Wrong password" });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err); //send error response    
    }

});

// export module ------------------------------------------
module.exports = router;