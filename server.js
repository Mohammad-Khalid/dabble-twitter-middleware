require('dotenv').config()

const express = require('express');
var session = require('cookie-session');
var uuidv1 = require('uuid/v1');
var config = require('./config/setting');

const app = express();
app.set('trust proxy', 1)
app.set('port', (process.env.PORT || 5000));

app.use(session({ secret: "bQeThWmZ", cookie: { maxAge: 2592000 }}))


var twitterAPI = require('node-twitter-api');

var twitter = new twitterAPI({
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    callback: "https://alexaskills.tk/oauth/callback"
});

app.get('/', (req, res) => {
	res.send("Hello!");
});

app.get("/app",(req,res)=>{
    res.send('<h1>homepage for Tweeter Account Link!</h1>')
})
app.get("/privacy",(req,res)=>{
  res.send('<h1>Placeholder for a policy info page</h1>')
})

app.get('/oauth/request_token', (req, res) => {
	var sess = req.session;
	sess.consumer_key = config.consumerKey;
	sess.consumer_secret = config.consumerSecret;
	sess.state = req.query.state;
	sess.client_id = req.query.client_id;
	sess.redirect_uri = req.query.redirect_uri;
	
	twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
		if (error) {
			console.log("Error getting OAuth request token : ");
			console.log(error);
		} else {
			console.log(results)
			sess.request_token = requestToken;
			sess.request_token_secret = requestTokenSecret;
				
			res.status(200).redirect('https://twitter.com/oauth/authenticate?oauth_token='+requestToken);
		}
	});
  
});


app.get('/oauth/callback', (req, res) => {
	var sess = req.session;
	requestToken = sess.request_token;
	requestTokenSecret = sess.request_token_secret;
	oauth_verifier =  req.query.oauth_verifier;
	
	twitter.getAccessToken(requestToken, requestTokenSecret, oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
		if (error) {
			console.log(error);
		} else {

			params = {};
			twitter.verifyCredentials(accessToken, accessTokenSecret, params, function(error, data, response) {
			if (error) {
				console.log("Error while verifying.");
				res.send("Error while verifying.");
			} else {
				//console.log(response);
				console.log("Success; name:"+data["screen_name"]);
				
				var redirect_alexa = decodeURI(sess.redirect_uri)+
				"#state="+sess.state+
				"&access_token="+accessToken+","+accessTokenSecret+
				"&client_id="+sess.client_id+
				"&token_type=Bearer";
				
				console.log(redirect_alexa);
				
				res.status(200).redirect(redirect_alexa);
				
			}
		});
		}
	});
});

  
app.listen(app.get('port'), () => {
  console.log('Express server started on port 5000');
});