const express = require('express');
const pg = require('pg');
const dbURI = "postgres://kqtgokmgwwiwlv:6eadab2bf3f619a6cbffdf551abd6d0469b1134ceda61ac432a9b090941bc610@ec2-54-75-235-28.eu-west-1.compute.amazonaws.com:5432/d9nba8lrkjpjeu"
    + "?ssl=true"; // for encryption
const connString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({connectionString: connString });
const crypto = require('crypto');
const secret = "frenchfriestastegood!"; // for tokens = should be store as an environment variable;
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
                res.status(200).json({ email: result.rows[0].email, userid: result.rows[0].id, token: tok });
            } else {
                res.status(400).json({ msg: "Wrong password" });
            }
        }
    } catch (err) {
        res.status(500).json(err); //send error response    
    }

});

// export module ------------------------------------------
module.exports = router;