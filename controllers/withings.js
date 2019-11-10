const config = require('../config').withings;
const Withings = require('../lib/Withings');

exports.auth = async(ctx) => {
  // const { token } = ctx.query;
  /*
  const user = await User.findByToken(token);
  ctx.assert(user, 401);

  const client = new FitbitClient(user);
  */
  // ctx.redirect(authURL(token));
  ctx.redirect(Withings.authURL());
};

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
    const data = await Withings.accessTokenRequest(
      {
        grant_type: 'authorization_code',
        client_id: clientID,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectURI
      }
    ).catch((err) => {
      ctx.status = 400;
      ctx.body = err.message;
    });

    if (data) {
      Withings.newToken(user, data);
      ctx.status = 201;
      ctx.body = 'Token added';
    }
  } else {
    ctx.status = 400;
    ctx.body = 'Must provide authorization code';
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
