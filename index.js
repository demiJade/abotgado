'use strict'
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var fs = require('fs');

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var userUrl = 'mongodb://localhost:27017/users';
var bcrypt = require('bcryptjs');
var session = require('express-session');


var url = 'mongodb://localhost:27017/mydb';

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const socketIO = require('socket.io');
const app = express()

var cities = [
	"Quezon",
	"Manila",
	"Pasig",
	"Marikina",
	""
];


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
app.use(express.static('resource'));
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

        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
        	sendPostbackMessage(event.sender.id);
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
  if (messageText != undefined){
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
	  				  "B - I have a question about legal forms. \n" +
	  				  "C - I want to find the nearest law firm. \n" +
	  				  "D - I want to find the nearest Public Attorney's Office \n" +
	  				  "E - I want to talk to a lawyer. \n" +
	  				  "F - I am being assaulted and need urgent legal help. \n";
	  	sendTextMessage(senderID, message);
	  } else if (messageText == "A" || messageText == "a") {
	  	var message = "A1 - How do you file a case? \n" +
	  				  "A2 - I have a question regarding... \n";
	  	sendTextMessage(senderID, message);
	  } else if (messageText == "B" || messageText == "b") {
	  	var message = "B1 - Deed of Absolute Sale (Real Estate Property) \n" +
	  				  "B2 - Contract to Sell (Real Estate Property) \n" +
	  				  "B3 - Chattel Mortgage (Motor Vehicle) \n" +
	  				  "B4 - Contract of Lease/ Rent \n" +
	  				  "B5 - Rent-to-Own Contract (Real Estate Property) \n" +
	  				  "B6 - Deed of Sale (Motor Vehicle) \n" +
	  				  "B7 - General Form of Affidavit \n" +
	  				  "B8 - Affidavit of Loss \n" +
	  				  "B9 - Earnest Money Receipt Agreement \n" +
	  				  "B10 - Affidavit of Desistance \n" +
	  				  "B* - More options \n ";
	  	sendTextMessage(senderID, message);
	  } else if (messageText == "B*" || messageText == "b*"){
	  	var message = "More options: \n" +
	  				  "B11 - Acknowledgement of Receipt for Payments \n" +
	  				  "B12 - Acknowledgement of Debt \n" +
	  				  "B13 - General Power of Attorney \n" +
	  				  "B14 - Special Power of Attorney \n" +
	  				  "B15 - Deed of Assignment and Transer of Rights \n" +
	  				  "B16 - Deed of Donation \n" +
	  				  "B17 - Contract of Renovation/ Construction of a House or Building \n" +
	  				  "B18 - Authority to Sell/ Lease \n" +
	  				  "B19 - Offer to Purchase \n" +
	  				  "B20 - Last Will and Testament \n";
	  	sendTextMessage(senderID, message);
	  } else if (messageText == "C" || messageText == 'c'){
	  	var message = "Please enter your city in this format: \n" +
	  				  "Example: Quezon #City";
	  	sendTextMessage(senderID, message);
	  } else if (messageText.indexOf('#city') >= 0 || messageText.indexOf('city') >= 0 || messageText.indexOf('City') >= 0) {
	  	var text = messageText.split(" ");
	  	var city = text[0];
	  	var url = "https://www.google.com/maps/search/law+firm+near+" + city + ",+Philippines/";
	  	var elements = [{
	  		title: "Law Firms Near Your Location",
	  		image_url: "http://is2.mzstatic.com/image/thumb/Purple122/v4/0f/4e/67/0f4e672e-76f1-4a13-6be1-e3a057184fc6/source/175x175bb.jpg",
	  		item_url: url
	  	}];
	  	sendUrlMessage(senderID, elements);
	  }
	  else if (messageText == "D" || messageText == 'd'){
	  	var message = "Please enter your city in this format: \n" +
	  				  "Example: Quezon #City";
	  	sendTextMessage(senderID, message);
	  } else if (messageText.indexOf('#city') >= 0 || messageText.indexOf('city') >= 0 || messageText.indexOf('City') >= 0) {
	  	var text = messageText.split(" ");
	  	var city = text[0];
	  	var url = "https://www.google.com/maps/search/public+attorney+office+near+" + city + ",+Philippines/";
	  	var elements = [{
	  		title: "Public Attorney's Office Near Your Location",
	  		image_url: "http://is2.mzstatic.com/image/thumb/Purple122/v4/0f/4e/67/0f4e672e-76f1-4a13-6be1-e3a057184fc6/source/175x175bb.jpg",
	  		item_url: url
	  	}];
	  	sendUrlMessage(senderID, elements);
	  }
	  	else if (messageText == "A1" || messageText == "a1"){
	  	var message = "What type of case? \n" +
	  				  "A3 - Criminal \n" +
	  				  "A4 - Civil \n";
	  	sendTextMessage(senderID, message);
	  } else if (messageText == "A2" || messageText == 'a2'){

	  } else if (messageText == "A3" || messageText == "a3"){
	  	var elements = [{title: "File Criminal Case – Philippines",
	            subtitle: "Guide to Filing a Criminal Case in the Philippines",
	            item_url: "http://www.duranschulze.com/guide-filing-criminal-case-philippines/",
	            image_url: "http://www.duranschulze.com/wp-content/uploads/2016/04/Filing-Criminal-Case-1.png"}];

	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "A4" || messageText == "a4"){
	  	var elements = [{title: "File Civil Case – Philippines",
	            subtitle: "Guide to Filing a Civil Case in the Philippines",
	            item_url: "http://www.duranschulze.com/guide-filing-civil-case-philippines/",
	            image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B1" || messageText == "b1"){
	  	var elements = [{title: "Deed of Absolute Sale",
	            subtitle: "Real Estate Property",
	            item_url: "http://legal-forms.philsite.net/deed-of-sale.htm",
	            image_url: "http://legal-forms.philsite.net/_borders/Banner.jpg"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B2" || messageText == "b2"){
	  	var elements = [{title: "Contract to Sell",
	            subtitle: "Real Estate Property",
	            item_url: "http://legal-forms.philsite.net/contract-to-sell.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B3" || messageText == "b3"){
	  	var elements = [{title: "Chattel Mortgage",
	            subtitle: "Motor Vehicle",
	            item_url: "http://legal-forms.philsite.net/chattel-mortgage.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B4" || messageText == "b4"){
	  	var elements = [{title: "Contract of Lease or rent",
	            //subtitle: "Motor Vehicle",
	            item_url: "http://legal-forms.philsite.net/lease-contract.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B5" || messageText == "b5"){
	  	var elements = [{title: "Rent-to-Own Contract",
	            subtitle: "Real Estate Property",
	            item_url: "http://legal-forms.philsite.net/rent-to-own.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B6" || messageText == "b6"){
	  	var elements = [{title: "Deed of Sale",
	            subtitle: "Motor Vehicle",
	            item_url: "http://legal-forms.philsite.net/deed-of-sale-vehicle.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B7" || messageText == "b7"){
	  	var elements = [{title: "General Form of Affidavit",
	            //subtitle: "Motor Vehicle",
	            item_url: "http://legal-forms.philsite.net/general-affidavit.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B8" || messageText == "b8"){
	  	var elements = [{title: "Affidavit of Loss",
	            subtitle: "Motor Vehicle registration/ License",
	            item_url: "http://legal-forms.philsite.net/affidavit-of-loss.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B9" || messageText == "b9"){
	  	var elements = [{title: "Earnest Money Receipt Agrement",
	            // subtitle: "Motor Vehicle registration/ License",
	            item_url: "http://legal-forms.philsite.net/receipt-agreement.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B10" || messageText == "b10"){
	  	var elements = [{title: "Affidavit of Desistance",
	            // subtitle: "Motor Vehicle registration/ License",
	            item_url: "http://legal-forms.philsite.net/affidavit-of-desistance.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B11" || messageText == "b11"){
	  	var elements = [{title: "Acknowledgement Receipt for Payments",
	            // subtitle: "Motor Vehicle registration/ License",
	            item_url: "http://legal-forms.philsite.net/acknowledgement-receipt.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B12" || messageText == "f12"){
	  	var elements = [{title: "Acknowledgement of Debt",
	            // subtitle: "Motor Vehicle registration/ License",
	            item_url: "http://legal-forms.philsite.net/acknowledgement-of-debt.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B13" || messageText == "b13"){
	  	var elements = [{title: "General Power of Attorney",
	            // subtitle: "Motor Vehicle registration/ License",
	            item_url: "http://legal-forms.philsite.net/power-of-attorney.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B14" || messageText == "b14"){
	  	var elements = [{title: "Special Power of Attorney",
	            // subtitle: "Motor Vehicle registration/ License",
	            item_url: "http://legal-forms.philsite.net/power-of-attorney2.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B15" || messageText == "b15"){
	  	var elements = [{title: "Deed of Assignment & Transfer of Rights",
	             subtitle: "Real Estate",
	            item_url: "http://legal-forms.philsite.net/transfer-of-rights.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B16" || messageText == "b16"){
	  	var elements = [{title: "Deed of Donation",
	             //subtitle: "Real Estate",
	            item_url: "http://legal-forms.philsite.net/deed-of-donation.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B17" || messageText == "b17"){
	  	var elements = [{title: "Contract of Renovtion/ Construction of House or Building",
	             //subtitle: "Real Estate",
	            item_url: "http://legal-forms.philsite.net/renovation-contract.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B18" || messageText == "b18"){
	  	var elements = [{title: "Authority to Sell/ Lease",
	             //subtitle: "Real Estate",
	            item_url: "http://legal-forms.philsite.net/authority-to-sell.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B19" || messageText == "b19"){
	  	var elements = [{title: "Offer to Purchase",
	             subtitle: "Real Estate Property",
	            item_url: "http://legal-forms.philsite.net/offer-to-purchase.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == "B20" || messageText == "b20"){
	  	var elements = [{title: "Last Will and Testament",
	             //subtitle: "Real Estate Property",
	            item_url: "http://legal-forms.philsite.net/will-testament.htm"}];
	            //image_url: "http://www.duranschulze.com/wp-content/uploads/2016/05/DDS-infographic_Civil_Case.png"}];
	  	sendUrlMessage(senderID, elements);
	  } else if (messageText == 'E' || messageText == 'e'){
	  	io.emit('new_message_from_bot', { message: "A client has found you." });
	  	var message = "Hello. You have been connected to a consultant. Send your concerns using an @atty tag. \n" +
	  				  "Example: @atty I have a concern regarding human rights.";
	  	sendTextMessage(senderID, message);
	  } else if (messageText.indexOf("@atty") != -1 || messageText.indexOf("@Atty") != -1){
	  	if (event.recipient.id == '1868439726765694'){
      		io.emit('new_message_from_bot', { message: messageText.replace("@atty", ""), event: event });
      	}
	  	// io.emit('new_message_from_bot', {message: messageText.replace("@c", ""), event: event});

	  } else if (messageText == 'F' || messageText == 'f'){
	  	var message = "We suggest calling the ff depending on your location: \n" +
						"National Capital Region: (02) 421-1918 \n" +
						"Region I: (072) 607-6528 \n" +
						"Region II: (078) 844-1630 \n" +
						"Region III: (045) 455-1145 \n" +
						"Region IV-A: (049) 531-7266 \n" +
						"Region IV-B: (043) 723-4248 \n" +
						"Region V: (052) 481-1656, (052) 481-5031 \n" +
						"Cordillera Administrative Region: (074) 304-2256, (074) 619-0986 \n";
		sendTextMessage(senderID, message);
	  } else if (messageText){
	  	sendTextMessage(senderID, "Got it!");
	  }
	  else if (messageAttachments) {
	    sendTextMessage(senderID, "Message with attachment received");
	  }
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

// function getUserData (user_id){
// 	request({
//     uri: 'https://graph.facebook.com/v2.6/' + user_id,
//     qs: { access_token: token },
//     method: 'POST',
//     json: messageData

//   }, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var recipientId = body.recipient_id;
//       var messageId = body.message_id;

//       console.log("Successfully sent generic message with id %s to recipient %s",
//         messageId, recipientId);
//     } else {
//       console.error("Unable to send message.");
//       console.error(response);
//       console.error(error);
//     }
//   });
// }
// io.sockets.on("new_message", function(data){
// 	  		console.log(data);
// 	  		sendTextMessage(senderID, data.message);
// 	  	})
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
  socket.on("new_message_from_consultant", function(data){
	console.log(data);
	sendTextMessage(data.senderId, data.message);
  })

});

app.get('/loadfiles', function(req, res){
    var directory = "casefiles";
    fs.readdir(directory, function(err, files) {
        console.log("Reading files");
        files.forEach(function(file) {
            console.log(file);
            var myfile = path.join(__dirname, directory, file);
            fs.readFile(myfile, 'utf-8', function(err, contents) {
                if (contents){
                    console.log("Officially reading a file");
                    inspectFile(contents);
                }
             });
        });
    });

    function inspectFile(contents) {
        var body = contents.replace(/[^a-z0-9]/gi, ' ');
        var x = body;
        var title = x.match(/H3(.*)H3/).pop();

        MongoClient.connect(url, function(err, db){
        if (err){
            console.log("Unable to connect to database", err);
        } else {
            console.log("Connection established");
            db.collection("cases").insert({"title":title, "body":body});
            console.log("TITLE:" + title);
            console.log("BODY:" + body);
            console.log("Done insert");
        }
        db.close();
        res.send("End");
    });
    }
});

app.get('/mapreduce', function(req, res){
    MongoClient.connect(url, function(err, db){
        if (err){
            console.log("Unable to connect to database", err);
        } else {
            console.log("Connection established");
            var collection = db.collection('cases');
            ReplaceMapReduce("cases", mapWords, reduceWordCount, "wordcount", function(){
                ReplaceMapReduce("wordcount", mapDocument, reduceKeywords, "keywords", function(){
                    db.collection("keywords").find({}).toArray(function (err, results){
                        if (err){
                            res.send(err);
                        } else if(results.length) {
                             var sending_results = [];
                             results.forEach(function(result){
                                var topfive = [];
                                result.value.words.forEach(function(word){
                                    if (topfive.length == 5){
                                        var smallest_index = getSmallestIndex(topfive, "count");
                                        if (topfive[smallest_index].count < word.count){
                                            if (word.word != "" && word.word != undefined)
                                            topfive[smallest_index] = word;
                                        }
                                    } else {
                                        if (word.word != "" && word.word != undefined)
                                        topfive.push(word);
                                    }
                                });
                                var obj = {
                                    title: result._id.title,
                                    topfive: topfive
                                }
                                sending_results.push(obj);
                             });
                             res.send(sending_results);
                         } else {
                             res.send("No documents found");
                         }
                         db.close();
                    })
                })
            })
        }
    })
});



var port = 3000;
app.listen(port);
console.log("Listening to port " + port);

io.on('connection', function (socket){
    socket.emit('news', { hello: 'world' });

})

var mapWords = function(){
    var articles = [
    "is", "are", "the", "and", "a", "an",
    "of", "for", "or", "in", "at", "to", "if",
    "in", "on", "their", "that", "sup", "style", "x",
    "with", "would", "was", "were"];
     if (this.body != undefined){
        var words = this.body.split(' ');
        var title = this.title;
        words.forEach(function (word){
            word = word.toLowerCase();
            if (articles.indexOf(word) == -1){
                if (word != "" && word != undefined){
                    emit({
                    title: title,
                    word: word
                    }, {
                        count: 1
                    });
                }
            }

        });
    }
}
var reduceWordCount = function(key, values){
    var count = 0;
    values.forEach(function (value){
        count += value.count;
    })
    return {
        count: count
    }
}

var mapDocument = function(){
    emit({
        title: this._id.title
    }, {
        words: [{
            word: this._id.word,
            count: this.value.count
        }]
    })
}


var reduceKeywords = function(key, values){
    var words = [];
    values.forEach(function (value){
        words.push(value.words[0]);
    })
    return {
        words: words
    }
}

var mapTopFive = function(){
    var word = {
        word: this._id.word,
        count: this.value.count
    };
    emit({
        title: this._id.title
    }, {
        words: [word]
    });
}

var getSmallestIndex = function(array, variable){
    var min = array[0][variable];
    var smallest_index = 0;
    array.forEach(function(x, index){
        if (x[variable] < min){
            min = x[variable];
            smallest_index = index;
        }
    });
    return smallest_index;
}

var reduceTopFive = function(key, values){
    var topfive = [];
    values.forEach(function(value){
        value.words.forEach(function(word){
            if (topfive.length < 5){
                topfive.push(word);
            } else {
                var smallest_index = getSmallestIndex(topfive, "count");
                if (word.count > topfive[smallest_index][count]){
                    topfive[smallest_index] = word;
                }
            }
        })
    });
    return {
        words: topfive
    }
}

var ReplaceMapReduce = function(collection, mapfunction, reducefunction, output, query, callback){
    MongoClient.connect(url, function(err, db){

            db.collection(collection).mapReduce(mapfunction, reducefunction, {
                out: {
                    replace: output
                }
            }, function(){
                db.close();
                if (callback){
                    callback();
                }
            });


    });
}
