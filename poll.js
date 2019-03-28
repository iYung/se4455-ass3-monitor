var ps = require('ps-node');
var nodemailer = require("nodemailer");
if (process.env.ENVIRO != "PROD") {
    require('dotenv').config()
}

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
    subject: 'Monitor is down',
    text: 'Oh no!',
};

function poll() {
    // A simple pid lookup 
    flag = false;

    ps.lookup({
        command: 'node',
        psargs: 'ux'
        }, function(err, resultList ) {
        if (err) {
            throw new Error( err );
        }

        arguments = resultList.map((process) => process.arguments[0]);

        if (arguments.indexOf('server.js') < 0) {
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
            });
        }
    });
}

setInterval(function() {
    console.log("Polling");
    poll();
}, 10000);