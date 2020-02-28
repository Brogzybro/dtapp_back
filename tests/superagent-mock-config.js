const withingsConfig = require('../config').withings;

const measureResponses = {
  success:
    '{"status": 0,"body":{"updatetime":1582852649,"timezone":"Europe/Oslo","measuregrps":[{"grpid":1861714605,"attrib":0,"date":1581694652,"created":1581694959,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":69,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861714553,"attrib":0,"date":1581694261,"created":1581694955,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":69,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861700816,"attrib":0,"date":1581693910,"created":1581694014,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":79,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861698211,"attrib":0,"date":1581693694,"created":1581693817,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":83,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861695900,"attrib":0,"date":1581693405,"created":1581693636,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":83,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1701164674,"attrib":0,"date":1573306690,"created":1573306690,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":73,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1681095505,"attrib":0,"date":1572362635,"created":1572362637,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":77,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1681091397,"attrib":0,"date":1572362474,"created":1572362475,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":76,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635261305,"attrib":0,"date":1570545169,"created":1570545171,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":68,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635252312,"attrib":0,"date":1570544857,"created":1570544859,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":67,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635242896,"attrib":0,"date":1570544521,"created":1570544522,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":71,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635139662,"attrib":0,"date":1570541000,"created":1570541002,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":74,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635132899,"attrib":0,"date":1570540789,"created":1570540791,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":74,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1633816124,"attrib":0,"date":1570459283,"created":1570459289,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":81,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1633811046,"attrib":0,"date":1570458875,"created":1570458878,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":75,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1633805383,"attrib":0,"date":1570458532,"created":1570458535,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":73,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null}]}}',
  invalidAccessToken:
    '{"status": 401, "body": {}, "error": "XRequestID: Not provided invalid_token: The access token provided is invalid"}'
};

const validAccessToken = '111b50ed52e42602ee500acc624411f17c4b0111';
const tokenResponses = {
  success:
    '{"access_token":"' +
    validAccessToken +
    '","expires_in":10800,"token_type":"Bearer","scope":"user.info,user.metrics,user.activity","refresh_token":"84151dcd36100bb76605675d5416a1abbf2e17d2","userid":19662645}',
  missingParams: '{"errors":[{"message":"invalid_params: invalid grant_type"}]}'
};

module.exports = [
  {
    pattern: withingsConfig.tokenURL + '.*',
    fixtures: function(match, params, headers, context) {
      return tokenResponses.success;
    },
    post: function(match, data) {
      return {
        body: JSON.parse(data),
        text: data,
        status: 200
      };
    }
  },
  {
    /**
     * regular expression of URL
     */
    // pattern: withingsConfig.measureUrl + '(.*)',
    pattern: withingsConfig.measureUrl + '.*',

    /**
     * returns the data
     *
     * @param match array Result of the resolution of the regular expression
     * @param params object sent by 'send' function
     * @param headers object set by 'set' function
     * @param context object the context of running the fixtures function
     */
    fixtures: function(match, params, headers, context) {
      /**
       * Returning error codes example:
       *   request.get('https://domain.example/404').end(function(err, res){
       *     console.log(err); // 404
       *     console.log(res.notFound); // true
       *   })
       */
      const url = new URL(match);
      const queryParams = url.searchParams;
      console.info(queryParams.get('action'));
      console.info(match);
      console.info(params);
      console.info('authorization:', headers['Authorization']);

      if (headers['Authorization'] === 'Bearer ' + validAccessToken)
        return measureResponses.success;
      else return measureResponses.invalidAccessToken;

      if (match[1] === '/404') {
        throw new Error(404);
      }

      if (match[1] === '/measure') {
        console.info(match);
        throw new Error(404);
      }

      /**
       * Checking on parameters example:
       *   request.get('https://domain.example/hero').send({superhero: "superman"}).end(function(err, res){
       *     console.log(res.body); // "Your hero: superman"
       *   })
       */

      if (match[1] === '/hero') {
        if (params['superhero']) {
          return 'Your hero:' + params['superhero'];
        } else {
          return 'You didnt choose a hero';
        }
      }

      /**
       * Checking on headers example:
       *   request.get('https://domain.example/authorized_endpoint').set({Authorization: "9382hfih1834h"}).end(function(err, res){
       *     console.log(res.body); // "Authenticated!"
       *   })
       */

      if (match[1] === '/authorized_endpoint') {
        if (headers['Authorization']) {
          return 'Authenticated!';
        } else {
          return 'test'; // throw new Error(401); // Unauthorized
        }
      }

      /**
       * Cancelling the mocking for a specific matched route example:
       *   request.get('https://domain.example/server_test').end(function(err, res){
       *     console.log(res.body); // (whatever the actual server would have returned)
       *   })
       */

      if (match[1] === '/server_test') {
        context.cancel = true; // This will cancel the mock process and continue as usual (unmocked)
        return null;
      }

      /**
       * Delaying the response with a specific number of milliseconds:
       *   request.get('https://domain.example/delay_test').end(function(err, res){
       *     console.log(res.body); // This log will be written after the delay time has passed
       *   })
       */

      if (match[1] === '/delay_test') {
        context.delay = 3000; // This will delay the response by 3 seconds
        return 'zzZ';
      }

      /**
       * Mocking progress events:
       *   request.get('https://domain.example/progress_test')
       *     .on('progress', function (e) { console.log(e.percent + '%'); })
       *     .end(function(err, res){
       *       console.log(res.body); // This log will be written after all progress events emitted
       *     })
       */

      if (match[1] === '/progress_test') {
        context.progress = {
          parts: 3, // The number of progress events to emit one after the other with linear progress
          //   (Meaning, loaded will be [total/parts])
          delay: 1000, // [optional] The delay of emitting each of the progress events by ms
          //   (default is 0 unless context.delay specified, then it's [delay/parts])
          total: 100, // [optional] The total as it will appear in the progress event (default is 100)
          lengthComputable: true, // [optional] The same as it will appear in the progress event (default is true)
          direction: 'upload' // [optional] superagent adds 'download'/'upload' direction to the event (default is 'upload')
        };
        return 'Hundred percent!';
      }
    },

    /**
     * returns the result of the GET request
     *
     * @param match array Result of the resolution of the regular expression
     * @param data  mixed Data returns by `fixtures` attribute
     */
    get: function(match, data) {
      return {
        body: data,
        text: data
      };
    },

    /**
     * returns the result of the POST request
     *
     * @param match array Result of the resolution of the regular expression
     * @param data  mixed Data returns by `fixtures` attribute
     */
    post: function(match, data) {
      return {
        status: 201
      };
    }
  }
];
