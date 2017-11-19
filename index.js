var  request = require('request'),
	express = require('express'), 
	path = require('path'),
	bodyParser = require('body-parser'),
	app = express();


var Client =  require('./models/Client');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(Client.Validate());
var _TOKEN = "EAAc1u8nFrJgBAH6exIA0egG0LuIT0ZBOmIcyN0CjOCj3oE7bZAuGQC5BXbmywuhoCWUjKn05Rr691IGxKI7hHk4qBUOZA33cu3tYWlgHv1YUV9NoZBiC4C3ZCZCHIzUL9AqxxoCZA9odhL2OgbYRmH4hECq8jSgEPVhiQ3rikyq5wZDZD";// fly23baeab4a1bef7bb1e5c2

app.listen(process.env.PORT || 1337, function() { console.log('webhook is listening')});

var PAGE_ACCESS_TOKEN = _TOKEN;



app.post('/webhook', function(req, res) {  
 	console.log("POST API..");
  var body = req.body;
  	//console.log(req.object);
  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    //console.log(JSON.stringify(body))
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
    	if(entry.messaging != undefined) {
		// Gets the message. entry.messaging is an array, but 
		// will only ever contain one message, so we get index 0
		var webhook_event = entry.messaging[0];
		//console.log(webhook_event);

		// Get the sender PSID
		//var sender_psid = w;
		  
      var param = {};
      param.psid = webhook_event.sender.id;
      param.recipient = webhook_event.recipient.id;
     
      

		// Check if the event is a message or postback and
		  // pass the event to the appropriate handler function
		  if (webhook_event.message) {
        if(entry.id != param.psid) {
           Client.Validate(param, function() {});
            handleMessage(param.psid, entry.id,  webhook_event.message);  
        }
            
        
		         
		  } else if (webhook_event.postback) {
		    handlePostback(param.psid, webhook_event.postback);
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
  var VERIFY_TOKEN = "orbit_bacs123!";
    
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
function handleMessage(sender_psid, fbpage_id, received_message) {

	console.log("handleMessage");

	 var response;

   response = {"attachment":{
                          "type":"template",
                              "payload": {
                                "template_type":"generic",
                                "elements":[
                                   {
                                    "title":"Company name",
                                    "image_url":"https://scontent.fmnl3-2.fna.fbcdn.net/v/t1.0-9/13466191_481989921997089_2746647707789501107_n.jpg?oh=055803014bc4cc5e780d207b04a7274e&oe=5AA406DA",
                                    "subtitle":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sit amet finibus sem. Ut nunc odio, euismod vitae euismod vitae ",
                                    "buttons":[
                                        {
                                          "type": "web_url",
                                          "url": "https://smapi.gupshup.io/sm/api/facebook/smartmsg/embed/ac5d9ad6-3df5-4386-9b34-d3f0800bfa49",
                                          "title":"Play",
                                         
                                        }              
                                      ]      
                                  }
                                ]
                              }
                           }
                    } 
   

//console.log(response);
   Client.Conversation(sender_psid, function(res) {
           var seq_num=1;
            if(res != undefined)
                seq_num = res.seq_num;
      
          Client.Message_template(fbpage_id, seq_num, function(res) {
             // console.log(JSON.stringify(res));
              if(res != undefined) {
              /* response = {
                    "text": res.template
                  }*/
              // Sends the response message
                 callSendAPI(sender_psid, response); 
                 Client.UpdateConversation(seq_num, sender_psid);
               }
          });
      
   });

  // Check if the message contains text
     
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
	console.log("handlePostback");
  console.log(received_postback);

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
  console.log(JSON.stringify(message));
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
