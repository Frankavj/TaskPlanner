const express = require('express');
const cors = require('cors'); //when the clients aren't on the server
const app = express(); //server-app
const pg = require('pg');
const dbURI = "postgres://kqtgokmgwwiwlv:6eadab2bf3f619a6cbffdf551abd6d0469b1134ceda61ac432a9b090941bc610@ec2-54-75-235-28.eu-west-1.compute.amazonaws.com:5432/d9nba8lrkjpjeu"
    + "?ssl=true"; // for encryption
const connString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({connectionString: connString });
const crypto = require('crypto');
const secret = "frenchfriestastegood!"; // for tokens = should be store as an environment variable;
const jwt = require('jsonwebtoken');

let logindata;

// middleware ------------------------------------
app.use(cors()); //allow all CORS requests
app.use(express.json()); //for extracting json in the request-body
app.use('/', express.static('client')); //for serving client files

// endpoint - users POST ---------------------------------
app.post("/users", async function(req, res, next) {
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

// endpoint - users PUT --------------------------------- (Thomas)
app.put('/users', async function (req, res) {

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
    }


    catch(err) {
        res.status(500).json({error: err}); //send error response 
    }

});

// endpoint - users DELETE --------------------------------- (Cecilie)
app.delete('/users', async function (req, res) {

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
    }


    catch(err) {
        res.status(500).json({error: err}); //send error response 
    }

});


// endpoint - users GET --------------------------------- (Franka)
app.get('/users', async function (req, res) {

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


// endpoint - auth (login) POST ---------------------------------
router.post('/auth', async function (req, res) {

    let updata = req.body // the data sent from the client

    // get the user from the db
    let sql = "SELECT * FROM users WHERE username = $1";
    let values = [updata.uname];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length == 0) {
            res.status(400).json({ msg: "User doesn't exist" }); //send response 
        } else {
            let check = crypto.compareSync(updata.password, result.rows[0].pwdhash);
            if (check) {
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


// endpoint - lists POST ---------------------------------
app.post("/lists", async function(req, res, next) {
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


// start server -----------------------------------
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server listening on port 3000!');
});