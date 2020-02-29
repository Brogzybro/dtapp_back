const validAccessToken = '111b50ed52e42602ee500acc624411f17c4b0111';
module.exports.validAccessToken = validAccessToken;
module.exports.mockTokenWrongAccessToken = {
  user: '5e564c0b2a2a4400171f2eee',
  data: {
    access_token: '03db50ed52e42602ee500acc624411f17c4b0224',
    expires_in: 10800,
    token_type: 'Bearer',
    scope: 'user.info,user.metrics,user.activity',
    refresh_token: '84151dcd36100bb76605675d5416a1abbf2e17d2',
    userid: 19662645
  }
};

module.exports.mockTokenValidAccessToken = {
  user: '5e564c0b2a2a4400171f2eee',
  data: {
    access_token: validAccessToken,
    expires_in: 10800,
    token_type: 'Bearer',
    scope: 'user.info,user.metrics,user.activity',
    refresh_token: '84151dcd36100bb76605675d5416a1abbf2e17d2',
    userid: 19662645
  }
};

// Sum of 48 samples

module.exports.heartListResponses = {
  // 5 samples in this response
  success:
    '{"status":0,"body":{"series":[{"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","model":44,"ecg":{"signalid":2500907,"afib":2},"bloodpressure":{"diastole":69,"systole":111},"heart_rate":73,"timestamp":1581694652},{"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","model":44,"ecg":{"signalid":2500905,"afib":0},"bloodpressure":{"diastole":69,"systole":131},"heart_rate":57,"timestamp":1581694261},{"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","model":44,"ecg":{"signalid":2500741,"afib":0},"bloodpressure":{"diastole":79,"systole":111},"heart_rate":72,"timestamp":1581693910},{"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","model":44,"ecg":{"signalid":2500702,"afib":0},"bloodpressure":{"diastole":83,"systole":140},"heart_rate":68,"timestamp":1581693694},{"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","model":44,"ecg":{"signalid":2500669,"afib":0},"bloodpressure":{"diastole":83,"systole":138},"heart_rate":69,"timestamp":1581693405}],"more":false,"offset":0}}',
  invalidAccessToken:
    '{"status": 401, "body": {}, "error": "XRequestID: Not provided invalid_token: The access token provided is invalid"}'
};

module.exports.heartGetResponses = {
  // 10000 integers in body.signal (https://wbsapi.withings.net/v2/heart?action=get&signalid=2500741)
  success: require('./superagent-mock-heartgetdata'),
  // With invalid access token (https://wbsapi.withings.net/v2/heart?action=get&signalid=2500741)
  invalidAccessToken:
    '{"status": 401, "body": {}, "error": "XRequestID: Not provided invalid_token: The access token provided is invalid"}'
};

module.exports.measureResponses = {
  // 16 samples in this response
  successType9:
    '{"status": 0,"body":{"updatetime":1582852649,"timezone":"Europe/Oslo","measuregrps":[{"grpid":1861714605,"attrib":0,"date":1581694652,"created":1581694959,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":69,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861714553,"attrib":0,"date":1581694261,"created":1581694955,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":69,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861700816,"attrib":0,"date":1581693910,"created":1581694014,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":79,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861698211,"attrib":0,"date":1581693694,"created":1581693817,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":83,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861695900,"attrib":0,"date":1581693405,"created":1581693636,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":83,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1701164674,"attrib":0,"date":1573306690,"created":1573306690,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":73,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1681095505,"attrib":0,"date":1572362635,"created":1572362637,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":77,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1681091397,"attrib":0,"date":1572362474,"created":1572362475,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":76,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635261305,"attrib":0,"date":1570545169,"created":1570545171,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":68,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635252312,"attrib":0,"date":1570544857,"created":1570544859,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":67,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635242896,"attrib":0,"date":1570544521,"created":1570544522,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":71,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635139662,"attrib":0,"date":1570541000,"created":1570541002,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":74,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635132899,"attrib":0,"date":1570540789,"created":1570540791,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":74,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1633816124,"attrib":0,"date":1570459283,"created":1570459289,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":81,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1633811046,"attrib":0,"date":1570458875,"created":1570458878,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":75,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1633805383,"attrib":0,"date":1570458532,"created":1570458535,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":73,"type":9,"unit":0,"algo":0,"fm":3}],"comment":null}]}}',
  // 16 samples in this response
  successType10:
    '{"status":0,"body":{"updatetime":1582934623,"timezone":"Europe/Oslo","measuregrps":[{"grpid":1861714605,"attrib":0,"date":1581694652,"created":1581694959,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":111,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861714553,"attrib":0,"date":1581694261,"created":1581694955,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":131,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861700816,"attrib":0,"date":1581693910,"created":1581694014,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":111,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861698211,"attrib":0,"date":1581693694,"created":1581693817,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":140,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1861695900,"attrib":0,"date":1581693405,"created":1581693636,"category":1,"deviceid":"153570f9668b0259ffef08536f8f3ba879774490","measures":[{"value":138,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1701164674,"attrib":0,"date":1573306690,"created":1573306690,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":131,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1681095505,"attrib":0,"date":1572362635,"created":1572362637,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":127,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1681091397,"attrib":0,"date":1572362474,"created":1572362475,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":131,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635261305,"attrib":0,"date":1570545169,"created":1570545171,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":118,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635252312,"attrib":0,"date":1570544857,"created":1570544859,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":117,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635242896,"attrib":0,"date":1570544521,"created":1570544522,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":137,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635139662,"attrib":0,"date":1570541000,"created":1570541002,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":117,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1635132899,"attrib":0,"date":1570540789,"created":1570540791,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":117,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1633816124,"attrib":0,"date":1570459283,"created":1570459289,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":134,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1633811046,"attrib":0,"date":1570458875,"created":1570458878,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":137,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null},{"grpid":1633805383,"attrib":0,"date":1570458532,"created":1570458535,"category":1,"deviceid":"db6f1410db71561bc9934baa3d4d6dc81eb8cdda","measures":[{"value":133,"type":10,"unit":0,"algo":0,"fm":3}],"comment":null}]}}',
  invalidAccessToken:
    '{"status": 401, "body": {}, "error": "XRequestID: Not provided invalid_token: The access token provided is invalid"}'
};

module.exports.sleepResponses = {
  // 11 samples in this response
  success:
    '{"status":0,"body":{"series":[{"id":1342202158,"timezone":"Europe/Oslo","model":32,"startdate":1582555020,"enddate":1582570260,"date":"2020-02-24","data":{"wakeupduration":1860,"lightsleepduration":8160,"deepsleepduration":3480,"wakeupcount":0,"durationtosleep":1860,"remsleepduration":1740,"durationtowakeup":0},"modified":1582577647},{"id":1341509419,"timezone":"Europe/Oslo","model":32,"startdate":1582503840,"enddate":1582535700,"date":"2020-02-24","data":{"wakeupduration":3780,"lightsleepduration":13080,"deepsleepduration":8160,"wakeupcount":1,"durationtosleep":1020,"remsleepduration":6600,"durationtowakeup":2460},"modified":1582710043},{"id":1335879805,"timezone":"Europe/Oslo","model":32,"startdate":1582064940,"enddate":1582096260,"date":"2020-02-19","data":{"wakeupduration":4500,"lightsleepduration":15660,"deepsleepduration":4740,"wakeupcount":3,"durationtosleep":1560,"remsleepduration":6180,"durationtowakeup":600},"modified":1582710042},{"id":1342826125,"timezone":"Europe/Oslo","model":32,"startdate":1582608420,"enddate":1582630140,"date":"2020-02-25","data":{"wakeupduration":4260,"lightsleepduration":7980,"deepsleepduration":6300,"wakeupcount":1,"durationtosleep":1620,"remsleepduration":2940,"durationtowakeup":2160},"modified":1582710043},{"id":1340507493,"timezone":"Europe/Oslo","model":32,"startdate":1582411680,"enddate":1582444140,"date":"2020-02-23","data":{"wakeupduration":3240,"lightsleepduration":15480,"deepsleepduration":5760,"wakeupcount":1,"durationtosleep":2700,"remsleepduration":7980,"durationtowakeup":0},"modified":1582710043},{"id":1339510054,"timezone":"Europe/Oslo","model":32,"startdate":1582345080,"enddate":1582360980,"date":"2020-02-22","data":{"wakeupduration":1800,"lightsleepduration":10740,"deepsleepduration":720,"wakeupcount":0,"durationtosleep":1260,"remsleepduration":2640,"durationtowakeup":540},"modified":1582710043},{"id":1344095502,"timezone":"Europe/Oslo","model":32,"startdate":1582681020,"enddate":1582709880,"date":"2020-02-26","data":{"wakeupduration":2160,"lightsleepduration":13200,"deepsleepduration":4680,"wakeupcount":0,"durationtosleep":1260,"remsleepduration":8820,"durationtowakeup":900},"modified":1582717267},{"id":1344615619,"timezone":"Europe/Oslo","model":32,"startdate":1582726680,"enddate":1582737480,"date":"2020-02-26","data":{"wakeupduration":1500,"lightsleepduration":4920,"deepsleepduration":3420,"wakeupcount":0,"durationtosleep":1500,"remsleepduration":960,"durationtowakeup":0},"modified":1582746270},{"id":1345199792,"timezone":"Europe/Oslo","model":32,"startdate":1582768980,"enddate":1582793220,"date":"2020-02-27","data":{"wakeupduration":2340,"lightsleepduration":10320,"deepsleepduration":5280,"wakeupcount":0,"durationtosleep":2340,"remsleepduration":6300,"durationtowakeup":0},"modified":1582800606},{"id":1345688668,"timezone":"Europe/Oslo","model":32,"startdate":1582818240,"enddate":1582828860,"date":"2020-02-27","data":{"wakeupduration":1020,"lightsleepduration":4500,"deepsleepduration":3540,"wakeupcount":0,"durationtosleep":1020,"remsleepduration":1560,"durationtowakeup":0},"modified":1582836245},{"id":1346333530,"timezone":"Europe/Oslo","model":32,"startdate":1582865580,"enddate":1582882140,"date":"2020-02-28","data":{"wakeupduration":1680,"lightsleepduration":7380,"deepsleepduration":3360,"wakeupcount":0,"durationtosleep":1680,"remsleepduration":4140,"durationtowakeup":0},"modified":1582889527}],"more":false,"offset":0}}',
  invalidAccessToken:
    '{"status": 401, "body": {}, "error": "XRequestID: Not provided invalid_token: The access token provided is invalid"}'
};

module.exports.tokenResponses = {
  success:
    '{"access_token":"' +
    validAccessToken +
    '","expires_in":10800,"token_type":"Bearer","scope":"user.info,user.metrics,user.activity","refresh_token":"84151dcd36100bb76605675d5416a1abbf2e17d2","userid":19662645}',
  missingParams: '{"errors":[{"message":"invalid_params: invalid grant_type"}]}'
};
