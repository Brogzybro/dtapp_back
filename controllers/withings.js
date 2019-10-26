const Token = require('../models/WithingsToken');
const config = require('../config').withings;
const request = require('request');
const querystring = require('querystring');

function authURL() {
  const { clientID, scope, redirectURI, state } = config;
  const url = new URL(config.authURL);
  const params = url.searchParams;
  params.set('response_type', 'code');
  params.set('client_id', clientID);
  params.set('scope', scope);
  params.set('redirect_uri', redirectURI);
  params.set('state', state);
  return url;
};

function getAuthor(code, state) {
 
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

exports.callback = async(ctx) => {
  const { code } = ctx.query;
  const { clientID, clientSecret, redirectURI } = config;

  console.log(ctx.query);
  // if(req.query)
  if (code) {
    request({
      uri: 'https://account.withings.com/oauth2/token',
      method: 'POST',
      body: querystring.stringify({
        grant_type: 'authorization_code',
        client_id: clientID,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectURI
      })
    }, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body);
        const data = JSON.parse(body);
        console.log(data.access_token);
        const access_token = data.access_token;
        Token.create(data, function(err, mdata) {
          console.log('err: ' + err);
        });

        console.log('Sent request for access token');
      } else {
        console.error('Unable to send message.');

        // console.error(response);
        console.error(error);
        console.log(response);
        console.log(response.body);
        console.log(response.statusCode);
      }
    });
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
