const express = require("express");
const os = require("os");
const app = express();
var bodyParser = require("body-parser");
const format = require("util").format;
var uuid = require("uuid");
var mysql = require('mysql');

if (process.env.ENVIRO != "PROD") {
    require('dotenv').config()
}

var connection = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB
  });

connection.connect()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var port = process.env.PORT || 3003;
var event = express.Router();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

event
    .post("/", (req, res) => {
        connection.query(
            "INSERT INTO EVENTS (CC_ID, VM_ID, EVENT_TIME, EVENT_TYPE, VM_TYPE) VALUES (" + req.body.cc_id + "," + req.body.vm_id + ", NOW(),'" + req.body.event_type + "','" + req.body.vm_type + "')", 
                function (err, rows, fields) {
                    if (err) throw err
                    return res.json({success: true});
            }
        )
    });

// This will serve the webpage
app.use("/event", event);
app.listen(port, () => console.log("Listening on port " + port));
