var  request = require('request'),
	express = require('express'), 
	path = require('path'),
	bodyParser = require('body-parser'),
	app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var _TOKEN = "EAAQ3Ep59OzEBAL6bca0ZAT1onAZAAUwMvxUilRPuWjrnmpaZAFCz4YiON6lfK5NarkxZBl1KzFUS9A1Wcb6eqoMFBCqMNLnRYfjr5yTFOXhmdPKnZBbJxi4kG8254GffjjEqJMOlJ3gImGKOyUIH3SlvdLRiYsLtkXZAdlJqCuYQZDZD";// fly23baeab4a1bef7bb1e5c2
app.listen(process.env.PORT || 1337, function() { console.log('webhook is listening')});

var PAGE_ACCESS_TOKEN = _TOKEN;

// Creates the endpoint for our webhook 
app.post('/webhook', function(req, res) {  
 	console.log("POST API here..");
  var body = req.body;
  console.log("---Body Start here---");
  	console.log(body);
    console.log("---Body End here---");
  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
    	if(entry.messaging.length > 0) {
		// Gets the message. entry.messaging is an array, but 
		// will only ever contain one message, so we get index 0
		var webhook_event = entry.messaging[0];
		console.log(webhook_event);

		// Get the sender PSID
		var sender_psid = webhook_event.sender.id;
		console.log('Sender PSID: ' + sender_psid);

		// Check if the event is a message or postback and
		  // pass the event to the appropriate handler function
		  if (webhook_event.message) {
		    handleMessage(sender_psid, webhook_event.message);        
		  } else if (webhook_event.postback) {
		    handlePostback(sender_psid, webhook_event.postback);
		  }
		}
    });

    // Returns a '200 OK' response to all requests
     console.log("200 OK");
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    console.log("404 Not Found");
    res.sendStatus(404);
  }

});


// Adds support for GET requests to our webhook
app.get('/webhook', function(req, res) {
	//fly23baeab4a1bef7bb1e5c2
  // Your verify token. Should be a random string.
  var VERIFY_TOKEN = _TOKEN;
    
  // Parse the query params
  var mode = req.query['hub.mode'];
  var token = req.query['hub.verify_token'];
  var challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

// Handles messages events
function handleMessage(sender_psid, received_message) {

	console.log("handleMessage");

	 var response;

  // Check if the message contains text
  if (received_message.text) {    
  		console.log(received_message.text);
    // Create the payload for a basic text message
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an image!`
    }
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response);    
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
	console.log("handlePostback");

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
	console.log("callSendAPI");
  var message = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

   request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": message
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 

}
