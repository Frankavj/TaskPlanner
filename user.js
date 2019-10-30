const express = require('express');
const pg = require('pg');
const dbURI = "postgres://kqtgokmgwwiwlv:6eadab2bf3f619a6cbffdf551abd6d0469b1134ceda61ac432a9b090941bc610@ec2-54-75-235-28.eu-west-1.compute.amazonaws.com:5432/d9nba8lrkjpjeu"
    + "?ssl=true"; // for encryption
const connString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({connectionString: connString });
const crypto = require('crypto');

const router = express.Router();

let logindata;

// endpoint - users POST ---------------------------------
router.post("/", async function(req, res, next) {
    let updata = req.body;

    // hash the pwd before it is stored in the db
    let hash = crypto.createHash('sha256').update(updata.password).digest('hex');

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

// endpoint - users GET --------------------------------- 
router.get('/', async function (req, res) {

    let sql = "SELECT * FROM users";

    // uncomment once we have authentication
    // let sql = "SELECT * FROM users WHERE userid=$1";
    // let values = [logindata.userid];

    try {
        let result = await pool.query(sql);
        res.status(200).json(result.rows); //send response    
    } catch (err) {
        res.status(500).json(err); //send response    
    }

});

// endpoint - users PUT --------------------------------- 
router.put('/', async function (req, res) {

    let updata = req.body; 

    let sql = 'SELECT * FROM users WHERE id = $1 RETURNING *'
    let values = [logindata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length == 0)  {
            res.status(400).json({msg: "User doesn't exist"}); //send response 
        }
        else {
            let check = bcrypt.compareSync(updata.oldpass, result.rows[0].pwdhash);
            if (check) {
                
                sql = "UPDATE users SET ";
                for(key of JSON.parse(updata)) {
                    console.log(key);
                }
            }
        }
    } catch(err) {
        res.status(500).json({error: err}); //send error response 
    }

});

// endpoint - users DELETE --------------------------------- 
router.delete('/', async function (req, res) {

    let updata = req.body; 

    let sql = 'DELETE FROM users WHERE id = $1 RETURNING *'
    let values = [updata.userid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0)  {
            res.status(200).json({msg: "Delete OK"}); //send response 
        }
        else {
            throw "Delete failed"
        }
    } catch(err) {
        res.status(500).json({error: err}); //send error response 
    }

});

// export module ------------------------------------------
module.exports = router;