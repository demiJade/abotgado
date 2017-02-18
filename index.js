'use strict'
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;



var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var userUrl = 'mongodb://localhost:27017/users';
var bcrypt = require('bcryptjs');
var session = require('express-session');

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const socketIO = require('socket.io');
const app = express()


// app.use(session({ secret: 'keyboard cat', resave:false, saveUninitialized:false }));
// app.use(passport.initialize());
// app.use(passport.session());

const token = "EAAZARuDUHiLABAA3PZClPUdNpZCUGCipOsV94kGdZA1N32evN0uRtzGRfvk4os6IA0PUfqssiPxjXAhYyBppQjgC3SQBMWLen6920Imrlzglp6ZCumsJ7m4q96zZA7Q6cotBehhXZBMZASQ4IJFILrpCTekoWLd1bJ96SZBe1x9POnAZDZD"
const PORT = process.env.PORT || 5000;

var server = app.listen(PORT);
console.log("Listening to port: " + PORT);
// const server = express()
//   .use((req, res) => res.sendFile(INDEX) )
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname,'views','index.html'));
// });
app.use(express.static('views'));
app.get('/', function (req, res){
    var user = req.user;
        res.sendFile(path.join(__dirname,'views','index.html'));
    console.log("sent user");
    console.log(user);
});

app.get('/signin', function(req, res){
    res.sendFile(path.join(__dirname, 'views', 'signin.html'));
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'team_liquid') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
// app.listen(app.get('port'), function() {
//     console.log('running on port', app.get('port'))
// })

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
      	if (event.recipient.id == '1868439726765694'){
      		io.emit('new_message', { message: event.message.text, event: event });
      	}
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
        	sendTextMessage(event.sender.id, "Postback received");
        	io.emit("new_postback", {postback: event.postback});
          
        } else {
        	console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;
  
  if (messageText == 'rift') {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    // switch (messageText) {
    //   case 'generic':
        sendGenericMessage(senderID);
      //   break;

      // default:
      	// sendAttachment(senderID);
      	// sendGenericMessage(senderID);
        
    // }
  } else if (messageText){
  	sendTextMessage(senderID, "Got it!");
  }
  else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendAttachment(recipientId) {
	var messageData = {
		recipient: {
			id: recipientId
		}, 
		message: {
	      attachment: {
	        
	          	type:"file",
		        payload:{
		          url:"http://www.lawphil.net/judjuris/juri2017/jan2017/pdf/gr_187448_2017.pdf"
		        }
	          }

	    }
	}
	callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendPostbackMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",

            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

// function sendTextMessage(sender, text) {
//     let messageData = { text:text }
//     request({
//         url: 'https://graph.facebook.com/v2.6/me/messages',
//         qs: {access_token:token},
//         method: 'POST',
//         json: {
//             recipient: {id:sender},
//             message: messageData,
//         }
//     }, function(error, response, body) {
//         if (error) {
//             console.log('Error sending messages: ', error)
//         } else if (response.body.error) {
//             console.log('Error: ', response.body.error)
//         }
//     })
// }


//===========================USER AUTHENTICATION =====================================================//
function authenticatedMiddleware(req, res, next){
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()){
        console.log("Authenticated!");
        next();
    }else{
        res.redirect('/signin');
    }
}

passport.use('local-login', new LocalStrategy(
    function (username, password, done){
        MongoClient.connect(userUrl, function(err, db){
            var Users = db.collection('localUsers');
            Users.findOne({"username":username}).then(function (user) {
                if (!user){
                    console.log("!user");
                    console.log(user);
                    return done(null, false);
                }
                if (!bcrypt.compareSync(password, user.password)){
                    console.log("wrong pass");
                    console.log(password);
                    return done(null, false);
                }
                return done(null, user);
                db.close();
            });
        });
    }
));

passport.use('local-reg', new LocalStrategy(
    {passReqToCallback: true},
    function (req, username, email, password, done){
        MongoClient.connect(userUrl, function(err, db){
            var Users = db.collection('localUsers');
            Users.findOne({"username":username}).then(function (user){
                if (user){
                    db.close();
                    done(null, false);
                } else {
                    var hash = bcrypt.hashSync(password, 8);
                    var user = {
                        "username": username,
                        "email": email,
                        "password": hash
                    }
                    Users.insert(user).then(function(){
                        db.close();
                        done(null, user);
                    });
                }
            });
            
        });
    }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(username, done) {
    done(null, username);
});

app.post('/login', function (req, res, next){
    console.log("logging in");
    passport.authenticate('local-login', function (err, user){
        if (err){
            console.log("error");
            console.log(user);
            return res.redirect('/signin');
        }
        if (!user){
            console.log("User not found");
            return res.redirect('/signin');
        }
        req.logIn(user, function(err){
            if (err){
                return next(err);
            }
            users.push(user);
            console.log("Logged in");
            return res.redirect('/');
        })
    })(req, res, next);
});

app.post('/register', function (req, res, next){
    passport.authenticate('local-reg', function (err, user){
        if (err){
            console.log("error");
            console.log(user);
            return res.redirect('/signin');
        }
        if (!user){
            console.log("User already exists");
            return res.redirect('/signin');
        }
        req.logIn(user, function(err){
            if (err){
                return next(err);
            }
            console.log("Logged in");
            return res.redirect('/');
        })
    })(req, res, next);
});

app.get('/logout', function(req, res){
  var name = req.user.username;
  console.log("LOGGIN OUT " + req.user.username)
  req.logout();
  res.redirect('/');
  req.session.notice = "You have successfully been logged out " + name + "!";
});


//=================================================================================================//

io.on('connection', function (socket) {
    console.log("socket.id" + socket.id);
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});