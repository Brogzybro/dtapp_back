const withingsConfig = require('../config').withings;
const fitbitConfig = require('../config').fitbit;
const logger = require('../config').winston.loggers.defaultLogger;
const {
  measureResponses,
  sleepResponses,
  tokenResponses,
  validAccessToken,
  heartGetResponses,
  heartListResponses,
  getDeviceResponses,
  getFitbitDevicesResponses
} = require('./superagent-mock-data');

function urlToRegEx(url) {
  return url.replace(/\?/g, '\\?') + '(.*)';
}

module.exports.config = [
  {
    // full url doesnt match for some reason, so manual typed
    pattern: urlToRegEx(fitbitConfig.apiURL + '/1/user/-/devices.json'),
    fixtures: function(match, params, headers, context) {
      logger.info('request fitbit getDeviceURL');
      logger.info('match %o', match);
      logger.info('headers %o', headers);
      if (headers['Authorization'] === 'Bearer ' + validAccessToken)
        return getFitbitDevicesResponses.success;
      else return getFitbitDevicesResponses.invalidAccessToken;
    },
    get: function(match, data) {
      return {
        body: JSON.parse(data),
        text: data,
        status: 200
      };
    }
  },
  {
    // full url doesnt match for some reason, so manual typed
    pattern: urlToRegEx(withingsConfig.getDeviceURL),
    fixtures: function(match, params, headers, context) {
      console.info('request getDeviceURL');
      console.info(match);
      if (headers['Authorization'] === 'Bearer ' + validAccessToken)
        return getDeviceResponses.success;
      else return getDeviceResponses.invalidAccessToken;
    },
    get: function(match, data) {
      return {
        body: JSON.parse(data),
        text: data,
        status: 200
      };
    }
  },
  {
    // full url doesnt match for some reason, so manual typed
    pattern: urlToRegEx(withingsConfig.sleepSummaryURL),
    fixtures: function(match, params, headers, context) {
      console.info('request sleepSummaryURL');
      console.info(match);
      if (headers['Authorization'] === 'Bearer ' + validAccessToken)
        return sleepResponses.success;
      else return sleepResponses.invalidAccessToken;
    },
    get: function(match, data) {
      return {
        body: JSON.parse(data),
        text: data,
        status: 200
      };
    }
  },
  {
    pattern: urlToRegEx(withingsConfig.heartGetURL),
    fixtures: function(match, params, headers, context) {
      console.info('request heartGetURL');
      if (headers['Authorization'] === 'Bearer ' + validAccessToken)
        return heartGetResponses.success;
      else return heartGetResponses.invalidAccessToken;
    },
    get: function(match, data) {
      return {
        body: JSON.parse(data),
        text: data,
        status: 200
      };
    }
  },
  {
    pattern: urlToRegEx(withingsConfig.heartListURL),
    fixtures: function(match, params, headers, context) {
      console.info('request heartListURL');
      if (headers['Authorization'] === 'Bearer ' + validAccessToken)
        return heartListResponses.success;
      else return heartListResponses.invalidAccessToken;
    },
    get: function(match, data) {
      return {
        body: JSON.parse(data),
        text: data,
        status: 200
      };
    }
  },
  {
    pattern: urlToRegEx(withingsConfig.tokenURL),
    fixtures: function(match, params, headers, context) {
      console.info('request tokenURL');
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
    pattern: urlToRegEx(withingsConfig.measureUrl),

    /**
     * returns the data
     *
     * @param match array Result of the resolution of the regular expression
     * @param params object sent by 'send' function
     * @param headers object set by 'set' function
     * @param context object the context of running the fixtures function
     */
    fixtures: function(match, params, headers, context) {
      console.info('request measureUrl');
      const urlS = new URLSearchParams(match[1]);
      console.info(urlS);
      console.info('authorization:', headers['Authorization']);

      if (headers['Authorization'] !== 'Bearer ' + validAccessToken)
        return measureResponses.invalidAccessToken;

      switch (urlS.get('meastype')) {
        case '1':
          console.log('got 1');
          return measureResponses.successWeight;
        case '5':
          console.log('got 5');
          return measureResponses.successFatFreeMass;
        case '6':
          console.log('got 6');
          return measureResponses.successFatRatio;
        case '8':
          console.log('got 8');
          return measureResponses.successFatMassWeight;
        case '71':
          console.log('got 71');
          return measureResponses.successBodyTemp;
        case '76':
          console.log('got 76');
          return measureResponses.successMuscleMass;
        case '88':
          console.log('got 88');
          return measureResponses.successBoneMass;
        case '91':
          console.log('got 91');
          return measureResponses.successPulseWaveVelocity;
        case '9':
          console.log('got 9');
          return measureResponses.successType9;
        case '10':
          console.log('got 10');
          return measureResponses.successType10;
        default:
          console.log('something else ' + urlS.get('meastype'));
          return measureResponses.successEmpty;
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
    }
  }
  // {
  //   /**
  //    * regular expression of URL
  //    */
  //   // pattern: withingsConfig.measureUrl + '(.*)',
  //   pattern: withingsConfig.measureUrl + '.*',

  //   /**
  //    * returns the data
  //    *
  //    * @param match array Result of the resolution of the regular expression
  //    * @param params object sent by 'send' function
  //    * @param headers object set by 'set' function
  //    * @param context object the context of running the fixtures function
  //    */
  //   fixtures: function(match, params, headers, context) {
  //     /**
  //      * Returning error codes example:
  //      *   request.get('https://domain.example/404').end(function(err, res){
  //      *     console.log(err); // 404
  //      *     console.log(res.notFound); // true
  //      *   })
  //      */
  //     const url = new URL(match);
  //     const queryParams = url.searchParams;
  //     console.info(queryParams.get('action'));
  //     console.info(match);
  //     console.info(params);
  //     console.info('authorization:', headers['Authorization']);

  //     if (headers['Authorization'] === 'Bearer ' + validAccessToken)
  //       return measureResponses.successType9;
  //     else return measureResponses.invalidAccessToken;

  //     if (match[1] === '/404') {
  //       throw new Error(404);
  //     }

  //     if (match[1] === '/measure') {
  //       console.info(match);
  //       throw new Error(404);
  //     }

  //     /**
  //      * Checking on parameters example:
  //      *   request.get('https://domain.example/hero').send({superhero: "superman"}).end(function(err, res){
  //      *     console.log(res.body); // "Your hero: superman"
  //      *   })
  //      */

  //     if (match[1] === '/hero') {
  //       if (params['superhero']) {
  //         return 'Your hero:' + params['superhero'];
  //       } else {
  //         return 'You didnt choose a hero';
  //       }
  //     }

  //     /**
  //      * Checking on headers example:
  //      *   request.get('https://domain.example/authorized_endpoint').set({Authorization: "9382hfih1834h"}).end(function(err, res){
  //      *     console.log(res.body); // "Authenticated!"
  //      *   })
  //      */

  //     if (match[1] === '/authorized_endpoint') {
  //       if (headers['Authorization']) {
  //         return 'Authenticated!';
  //       } else {
  //         return 'test'; // throw new Error(401); // Unauthorized
  //       }
  //     }

  //     /**
  //      * Cancelling the mocking for a specific matched route example:
  //      *   request.get('https://domain.example/server_test').end(function(err, res){
  //      *     console.log(res.body); // (whatever the actual server would have returned)
  //      *   })
  //      */

  //     if (match[1] === '/server_test') {
  //       context.cancel = true; // This will cancel the mock process and continue as usual (unmocked)
  //       return null;
  //     }

  //     /**
  //      * Delaying the response with a specific number of milliseconds:
  //      *   request.get('https://domain.example/delay_test').end(function(err, res){
  //      *     console.log(res.body); // This log will be written after the delay time has passed
  //      *   })
  //      */

  //     if (match[1] === '/delay_test') {
  //       context.delay = 3000; // This will delay the response by 3 seconds
  //       return 'zzZ';
  //     }

  //     /**
  //      * Mocking progress events:
  //      *   request.get('https://domain.example/progress_test')
  //      *     .on('progress', function (e) { console.log(e.percent + '%'); })
  //      *     .end(function(err, res){
  //      *       console.log(res.body); // This log will be written after all progress events emitted
  //      *     })
  //      */

  //     if (match[1] === '/progress_test') {
  //       context.progress = {
  //         parts: 3, // The number of progress events to emit one after the other with linear progress
  //         //   (Meaning, loaded will be [total/parts])
  //         delay: 1000, // [optional] The delay of emitting each of the progress events by ms
  //         //   (default is 0 unless context.delay specified, then it's [delay/parts])
  //         total: 100, // [optional] The total as it will appear in the progress event (default is 100)
  //         lengthComputable: true, // [optional] The same as it will appear in the progress event (default is true)
  //         direction: 'upload' // [optional] superagent adds 'download'/'upload' direction to the event (default is 'upload')
  //       };
  //       return 'Hundred percent!';
  //     }
  //   },

  //   /**
  //    * returns the result of the GET request
  //    *
  //    * @param match array Result of the resolution of the regular expression
  //    * @param data  mixed Data returns by `fixtures` attribute
  //    */
  //   get: function(match, data) {
  //     return {
  //       body: data,
  //       text: data
  //     };
  //   },

  //   /**
  //    * returns the result of the POST request
  //    *
  //    * @param match array Result of the resolution of the regular expression
  //    * @param data  mixed Data returns by `fixtures` attribute
  //    */
  //   post: function(match, data) {
  //     return {
  //       status: 201
  //     };
  //   }
  // }
];
