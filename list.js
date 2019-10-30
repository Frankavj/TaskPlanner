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

// endpoint - lists POST ---------------------------------
router.post("/", async function(req, res, next) {
    let updata = req.body;

    let sql = "INSERT INTO users (id, name, shared, tasks, hasAccess) VALUES(DEFAULT, $1, $2, $3, $4) RETURNING *";
    let values = [updata.name, updata.shared, updata.tasks, updata.hasAccess];

    try {
        let result = await pool.query(sql, values);

        if(result.rows.length > 0) {
            res.status(200).json({msg: `User created: ${updata.name}`})
        } else {
            throw "User creation failed.";
        }
    } catch (err) {
        res.status(500).json({error: err});
    }
});

// export module ------------------------------------------
module.exports = router;