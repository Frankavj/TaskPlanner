// Import dbURI -------------------------------------------------------------------------------------
const { dbURI } = require('../dbURI');

const express = require('express');
const pg = require('pg');
const connString = process.env.DATABASE_URL || dbURI;
const pool = new pg.Pool({ connectionString: connString });
const secret = "stroopwafelstastegood!"; // for tokens = should be store as an environment variable;
const jwt = require('jsonwebtoken');

const router = express.Router();

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
    let sql = "INSERT INTO tasks (id, name, completed, list, notes) VALUES(DEFAULT, $1, $2, $3, $4) RETURNING *";
    let values = [updata.name, false, updata.list, null];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length > 0) {
            res.status(200).json({ msg: `Task created: ${updata.name}` })
        } else {
            throw "Task creation failed.";
        }
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

// endpoint - completed tasks GET ----------------------------------
router.get('/:listid/:completed', async function (req, res, next) {

    let sql = "SELECT * FROM tasks WHERE list=$1 AND completed=$2";
    let values = [req.params.listid, req.params.completed];

    try {
        let result = await pool.query(sql, values);
        res.status(200).json(result.rows); //send response    
    } catch (err) {
        res.status(500).json(err); //send response    
    }

});

// endpoint - tasks PUT --------------------------------- 
router.put('/', async function (req, res, next) {

    let updata = req.body;

    let sql = 'SELECT * FROM tasks WHERE id = $1';
    let values = [updata.taskid];

    try {
        let result = await pool.query(sql, values);

        if (result.rows.length == 0) {
            res.status(400).json({ msg: "Task doesn't exist" }); //send response 
        } else {
            sql = "UPDATE tasks SET";

            // change task name
            if (!updata.update.localeCompare("name")) {
                sql = sql + ` name = $2`;
                values.push(updata.value);
            }
            // change completed
            if (!updata.update.localeCompare("completed")) {
                sql = sql + ` completed = $2`;
                values.push(updata.value);
            }
            // change notes
            if (!updata.update.localeCompare("notes")) {
                sql = sql + ` notes = $2`;
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
    } catch (err) {
        res.status(500).json(err); //send error response 
    }

});

// endpoint - tasks DELETE --------------------------------- 
router.delete('/', async function (req, res, next) {

    let updata = req.body;

    let sql = 'DELETE FROM tasks WHERE id = $1 RETURNING *'
    let values = [updata.taskid];

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