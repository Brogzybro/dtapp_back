const Token = require('../models/WithingsToken');
const config = require('../config').withings;
const request = require('request');
const querystring = require('querystring');

function authURL(state) {
  const { clientID, scope, redirectURI } = config;
  const url = new URL(config.authURL);
  const params = url.searchParams;
  params.set('response_type', 'code');
  params.set('client_id', clientID);
  params.set('scope', scope);
  params.set('redirect_uri', redirectURI);
  params.set('state', state);
  return url;
};

function testtest(name) {
  return 'my name is ' + name;
}
exports.testtest = testtest;

function getAuthor(code, state) {
 const { user } = ctx.state;
}

exports.auth = async(ctx) => {
  // const { token } = ctx.query;
  /*
  const user = await User.findByToken(token);
  ctx.assert(user, 401);

  const client = new FitbitClient(user);
  */
  // ctx.redirect(authURL(token));
  ctx.redirect(authURL());
};

exports.newToken = (user, data) => {
  data.user = user._id;
  Token.create(data, function(err, mdata) {
    console.log('token create err: ' + err);
  });
};

function accessTokenRequest(body) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://account.withings.com/oauth2/token',
      method: 'POST',
      body: body
    }, function(error, response, body) {
      if (!error) {
        if (response.statusCode === 200) {
          const data = JSON.parse(body);
          resolve(data);
        } else if (response.statusCode === 401) {
          reject(new Error('Invalid authorization code'));
        } else {
          reject(new Error('Unknown status code returned'));
        } 
      } else {
        reject(new Error('Request error.'));
      }
    });
  });
}

/**
 * Happens when withings redirects user back to our url with
 * authorization code and state. Then requests access token.
 *
 * @param ctx.query.code The authorization code
 * @param ctx.query.state The state
 */
exports.callback = async(ctx) => {
  const { code, state } = ctx.query;
  const { clientID, clientSecret, redirectURI } = config;
  const { user } = ctx.state;

  // if(req.query)
  if (code) {
    const data = await accessTokenRequest(
      querystring.stringify({
        grant_type: 'authorization_code',
        client_id: clientID,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectURI
      })
    ).catch((err) => {
      console.log('access token request failed', err);
    });

    if (data) {
      this.newToken(user, data);
    }
  }
  /*
  const user = await User.findByToken(state);
  ctx.assert(user, 401);

  const client = new FitbitClient(user);
  await client.callback(code);
  */
  // ctx.redirect('healthscraper://callback');
  // ctx.status = 200;
};

/*
  app.get('/userinfo', function (req, res){

    console.log(req.query);
    request({
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      uri: 'https://wbsapi.withings.net/v2/user?action=getdevice',
      method: 'GET'
      }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        console.log("Sent request for access token, " + typeof(body));
        data = JSON.parse(body);
        if(data && data.status == 0) {
          res.send(data.body)
        }else{
          res.send("shit idk")
        }
      } else {
        console.error("Unable to send message.");

        console.error(response);
        console.error(error);
        console.log(response.statusCode);
      }
    });
  });
*/
