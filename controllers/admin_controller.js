/* eslint-disable no-multi-str */
const Sample = require('../models/sample_model');
const User = require('../models/user_model');
const fitbitJob = require('../jobs/fitbit_job');
const withingsJob = require('../jobs/withings_job');
const SharedUser = require('../models/shared_user_model');
const logger = require('../config').winston.loggers.default;

const commands = {
  fitbitsync: () => fitbitJob(),
  withingssync: () => withingsJob.sync(),
  withingswipebp: async () => {
    await Sample.deleteMany({
      type: { $in: ['systolicBloodPressure', 'diastolicBloodPressure'] }
    });
  },
  withingswipeheart: async () => {
    await Sample.deleteMany({
      type: 'ecg'
    });
  },
  withingswipesleep: async () => {
    await Sample.deleteMany({
      type: 'sleep',
      source: 'withings'
    });
  },
  testSharedUser: async () => {
    /*
    // yoo
    const users = await User.find({ username: /^userTESTSHAREDUSER/ });
    logger.info('users %o', users);
    await User.deleteMany({ username: /^userTESTSHAREDUSER/ });
    try {
      const user = await User.create({
        username: 'userTESTSHAREDUSER' + Date.now(),
        password: 'yoyoyoyo'
      });
      const sharedUser = await SharedUser.create({ user: user });
    } catch (error) {
      console.log(error);
    }
    */
    const sharedUsers = await SharedUser.find();
    return sharedUsers;
  },
  test: async () => {
    console.log('test admin command');
  },
  testWithResponse: async () => {
    return 'Test response with body which is this. Yo yo yo yo.';
  }
};

exports.adminCommand = async ctx => {
  ctx.status = 200;
  if (ctx.query && ctx.query.action) {
    const command = commands[ctx.query.action];
    if (command) ctx.body = await command();
    else ctx.body = 'Unknown command';
  } else {
    let scriptStr =
      'currentResponsePos = -1;' +
      'allResponses = [];' +
      'shouldFollowLatest = true;' +
      '' +
      'function draw(){' +
      ' setResponseFields(allResponses[currentResponsePos])' +
      '}' +
      '' +
      'function firstReponse(){' +
      ' if(currentResponsePos === -1 ) return;' +
      ' currentResponsePos = 0;' +
      ' draw();' +
      '}' +
      'function lastReponse(){' +
      ' if(currentResponsePos === -1 ) return;' +
      ' currentResponsePos = allResponses.length - 1;' +
      ' draw();' +
      '}' +
      'function previousReponse(){' +
      ' if(currentResponsePos - 1 < 0) return;' +
      ' currentResponsePos--;' +
      ' draw();' +
      '}' +
      'function nextReponse(){' +
      ' if(currentResponsePos + 1 >= allResponses.length) return;' +
      ' currentResponsePos++;' +
      ' draw();' +
      '}' +
      '' +
      'function addResponse(resData){' +
      ' allResponses.push(resData);' +
      ' if(currentResponsePos === -1) nextReponse();' +
      ' else { if(shouldFollowLatest){currentResponsePos = allResponses.length - 1;}; draw(); }' +
      '}' +
      '' +
      'function processData(res, action){' +
      ' res.text().then(text => {' +
      '  str = (new Date()).toLocaleString();' +
      '  let data = {' +
      '   action: action,' +
      '   status: res.status,' +
      '   text: text,' +
      '   time: str.substr(str.indexOf(" ")+1)' +
      '  };' +
      '  addResponse(data);' +
      '  console.log(data);' +
      ' })' +
      '}' +
      '' +
      'function followLatestClicked(){' +
      ' shouldFollowLatest = document.getElementById("followLatest").checked;' +
      '}' +
      '' +
      'function setResponseFields(resData){' +
      ' document.querySelector("#responseActionField").innerText = resData.action;' +
      ' document.querySelector("#responseStatusField").innerText = resData.status;' +
      ' document.querySelector("#responseArea").innerText = resData.text;' +
      ' document.querySelector("#responseTimeField").innerText = resData.time;' +
      ' document.querySelector("#currentResponseField").innerText = currentResponsePos + 1;' +
      ' document.querySelector("#totalResponsesField").innerText = allResponses.length;' +
      '};';
    let htmlStr =
      '<h3>Response</h3>' +
      '<input type="checkbox" id="followLatest" name="followLatest" onclick="followLatestClicked()" checked>' +
      '<label for="followLatest"> Follow latest</label><br>' +
      '<button onclick="firstReponse()"><<</button>' +
      '<button onclick="previousReponse()"><</button><button onclick="nextReponse()">></button>' +
      '<button onclick="lastReponse()">>></button>' +
      ' <span id="currentResponseField">0</span> of <span id="totalResponsesField">0</span><br>' +
      '<textarea id="responseArea" rows="4" cols="30"></textarea><br>' +
      'Action: <span id="responseActionField"></span><br>' +
      'Status: <span id="responseStatusField"></span>' +
      '<span>\tTime: </span><span id="responseTimeField"></span>' +
      '<h3>Actions</h3>';
    for (let cmd in commands) {
      scriptStr +=
        'function myFunc' +
        cmd +
        '(){fetch("?action=' +
        cmd +
        '").then(res => processData(res, "' +
        cmd +
        '"))};'; // res.text().then(text => {' +
      /*
        'document.querySelector("#responseArea").innerText = text;' +
        'document.querySelector("#responseStatusField").innerText = res.status;' +
        'str = (new Date()).toLocaleString(); document.querySelector("#responseTimeField").innerText = str.substr(str.indexOf(" ")+1);' +
        '})
        */
      // .getReader().read().then(({ done, value }) => { console.log(value) }))}";
      htmlStr +=
        '<button onclick="myFunc' +
        cmd +
        '()">Run ' +
        cmd +
        '</button><br><br>';
    }

    ctx.body = '<script>' + scriptStr + '</script><h1>Commands</h1>' + htmlStr;
  }
};
