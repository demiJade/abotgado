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
  } else if (messageText == "hi" || messageText == "Hi") {
  	var message = "Hello. How may I help you? \n" +
  				  "A - I have a question about legal procedures.\n" + 
  				  "B - I have a question about legal forms. \n";
  	sendTextMessage(senderID, message);
  } else if (messageText == "A" || messageText == "a") {
  	var message = "C - How do you file a case? \n" + 
  				  "D - I have a question regarding... \n";
  	sendTextMessage(senderID, message);
  } else if (messageText == "B" || messageText == "b") {
  	var message = "F1 - Deed of Absolute Sale (Real Estate Property) \n" + 
  				  "F2 - Contract to Sell (Real Estate Property) \n" +
  				  "F3 - Chattel Mortgage (Motor Vehicle) \n" + 
  				  "F4 - Contract of Lease/ Rent \n" +
  				  "F5 - Rent-to-Own Contract (Real Estate Property) \n" + 
  				  "F6 - Deed of Sale (Motor Vehicle) \n" +
  				  "F7 - General Form of Affidavit \n" +
  				  "F8 - Affidavit of Loss \n" +
  				  "F9 - Earnest Money Receipt Agreement \n" +
  				  "F10 - Affidavit of Desistance \n" +
  				  "F* - More options \n ";
  				  // "F11 - Acknowledgement of Receipt for Payments \n" +
  				  // "F12 - Acknowledgement of Debt \n" +
  				  // "F13 - General Power of Attorney \n" +
  				  // "F14 - Special Power of Attorney \n" +
  				  // "F15 - Deed of Assignment and Transer of Rights \n" +
  				  // "F16 - Deed of Donation \n" +
  				  // "F17 - Contract of Renovation/ Construction of a House or Building \n" +
  				  // "F18 - Authority to Sell/ Lease \n" +
  				  // "F19 - Offer to Purchase \n" +
  				  // "F20 - Last Will and Testament \n"; 
  	sendTextMessage(senderID, message);		  
  } else if (messageText == "F*" || messageText == "f*"){
  	var message = "More options: \n" +
  				  "F11 - Acknowledgement of Receipt for Payments \n" +
  				  "F12 - Acknowledgement of Debt \n" +
  				  "F13 - General Power of Attorney \n" +
  				  "F14 - Special Power of Attorney \n" +
  				  "F15 - Deed of Assignment and Transer of Rights \n" +
  				  "F16 - Deed of Donation \n" +
  				  "F17 - Contract of Renovation/ Construction of a House or Building \n" +
  				  "F18 - Authority to Sell/ Lease \n" +
  				  "F19 - Offer to Purchase \n" +
  				  "F20 - Last Will and Testament \n"; 
  	sendTextMessage(senderID, message);
  }
  	else if (messageText == "C" || messageText == "c"){
  	var message = "What type of case? \n" +
  				  "C1 - Criminal \n" +
  				  "C2 - Civil \n";
  	sendTextMessage(senderID, message);		  
  } else if (messageText == "D" || messageText == 'd'){

  } else if (messageText == "C1" || messageText == "c1"){
  	var elements = [{title: "File Criminal Case – Philippines",
            subtitle: "Guide to Filing a Criminal Case in the Philippines",
            item_url: "http://www.duranschulze.com/guide-filing-criminal-case-philippines/",               
            image_url: "http://www.duranschulze.com/wp-content/uploads/2016/04/Filing-Criminal-Case-1.png"}];

  	sendUrlMessage(senderID, elements);
  } else if (messageText == "C2" || messageText == "c2"){
  	var elements = [{title: "File Civil Case – Philippines",
            subtitle: "Guide to Filing a Civil Case in the Philippines",
            item_url: "http://www.duranschulze.com/guide-filing-civil-case-philippines/",               
            image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F1" || messageText == "f1"){
  	var elements = [{title: "Deed of Absolute Sale",
            subtitle: "Real Estate Property",
            item_url: "http://legal-forms.philsite.net/deed-of-sale.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F2" || messageText == "f2"){
  	var elements = [{title: "Contract to Sell",
            subtitle: "Real Estate Property",
            item_url: "http://legal-forms.philsite.net/contract-to-sell.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F3" || messageText == "f3"){
  	var elements = [{title: "Chattel Mortgage",
            subtitle: "Motor Vehicle",
            item_url: "http://legal-forms.philsite.net/chattel-mortgage.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F4" || messageText == "f4"){
  	var elements = [{title: "Contract of Lease or rent",
            //subtitle: "Motor Vehicle",
            item_url: "http://legal-forms.philsite.net/lease-contract.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F5" || messageText == "f5"){
  	var elements = [{title: "Rent-to-Own Contract",
            subtitle: "Real Estate Property",
            item_url: "http://legal-forms.philsite.net/rent-to-own.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F6" || messageText == "f6"){
  	var elements = [{title: "Deed of Sale",
            subtitle: "Motor Vehicle",
            item_url: "http://legal-forms.philsite.net/deed-of-sale-vehicle.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F7" || messageText == "f7"){
  	var elements = [{title: "General Form of Affidavit",
            //subtitle: "Motor Vehicle",
            item_url: "http://legal-forms.philsite.net/general-affidavit.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F8" || messageText == "f8"){
  	var elements = [{title: "Affidavit of Loss",
            subtitle: "Motor Vehicle registration/ License",
            item_url: "http://legal-forms.philsite.net/affidavit-of-loss.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F9" || messageText == "f9"){
  	var elements = [{title: "Earnest Money Receipt Agrement",
            // subtitle: "Motor Vehicle registration/ License",
            item_url: "http://legal-forms.philsite.net/receipt-agreement.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F10" || messageText == "f10"){
  	var elements = [{title: "Affidavit of Desistance",
            // subtitle: "Motor Vehicle registration/ License",
            item_url: "http://legal-forms.philsite.net/affidavit-of-desistance.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F11" || messageText == "f11"){
  	var elements = [{title: "Acknowledgement Receipt for Payments",
            // subtitle: "Motor Vehicle registration/ License",
            item_url: "http://legal-forms.philsite.net/acknowledgement-receipt.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F12" || messageText == "f12"){
  	var elements = [{title: "Acknowledgement of Debt",
            // subtitle: "Motor Vehicle registration/ License",
            item_url: "http://legal-forms.philsite.net/acknowledgement-of-debt.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F13" || messageText == "f13"){
  	var elements = [{title: "General Power of Attorney",
            // subtitle: "Motor Vehicle registration/ License",
            item_url: "http://legal-forms.philsite.net/power-of-attorney.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F14" || messageText == "f14"){
  	var elements = [{title: "Special Power of Attorney",
            // subtitle: "Motor Vehicle registration/ License",
            item_url: "http://legal-forms.philsite.net/power-of-attorney2.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F15" || messageText == "f15"){
  	var elements = [{title: "Deed of Assignment & Transfer of Rights",
             subtitle: "Real Estate",
            item_url: "http://legal-forms.philsite.net/transfer-of-rights.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F16" || messageText == "f16"){
  	var elements = [{title: "Deed of Donation",
             //subtitle: "Real Estate",
            item_url: "http://legal-forms.philsite.net/deed-of-donation.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F17" || messageText == "f17"){
  	var elements = [{title: "Contract of Renovtion/ Construction of House or Building",
             //subtitle: "Real Estate",
            item_url: "http://legal-forms.philsite.net/renovation-contract.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F18" || messageText == "f18"){
  	var elements = [{title: "Authority to Sell/ Lease",
             //subtitle: "Real Estate",
            item_url: "http://legal-forms.philsite.net/authority-to-sell.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F19" || messageText == "f19"){
  	var elements = [{title: "Offer to Purchase",
             subtitle: "Real Estate Property",
            item_url: "http://legal-forms.philsite.net/offer-to-purchase.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } else if (messageText == "F20" || messageText == "f20"){
  	var elements = [{title: "Last Will and Testament",
             //subtitle: "Real Estate Property",
            item_url: "http://legal-forms.philsite.net/will-testament.htm"}];               
            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
  	sendUrlMessage(senderID, elements);
  } 


  else if (messageText){
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
    	text: "Here's what I found. Check out this link.",
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

function sendUrlMessage(recipientId, elements) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Here's what I found. Check out this link.",
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements
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