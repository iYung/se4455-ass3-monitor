const express = require("express");
const os = require("os");
const app = express();
var bodyParser = require("body-parser");
const format = require("util").format;
var uuid = require("uuid");
var mysql = require('mysql');
var fs = require("fs");
var nodemailer = require("nodemailer");

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

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
});

var mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL_TO,
    subject: 'Log Files',
    text: 'That was easy!',
    attachments: [
        {
            filename: 'log.csv',
            path: 'log.csv'
        }
    ]
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var port = process.env.PORT || 3003;
var event = express.Router();
var log = express.Router();

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
        );
        var stream = fs.createWriteStream("log.csv", {flags:'a'});
        stream.write(req.body.cc_id + ", " + req.body.vm_id + ", " + new Date().toISOString() + ", " + req.body.event_type + ", " + req.body.vm_type + "\n");
        stream.end();
    });

log
    .get("/", (req, res) => {
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        }); 
    });

// This will serve the webpage
app.use("/event", event);
app.use("/log", log);
app.listen(port, () => console.log("Listening on port " + port));
