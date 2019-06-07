const apn = require('apn');
const config = require('../config').apple;

const provider = new apn.Provider({
  token: {
    key: config.APNKey,
    keyId: config.APNKeyID,
    teamId: config.teamID
  },
  production: false // Use development server for now
});

async function send(user, title, body) {
  const { deviceTokens } = user.iOS;

  if (!deviceTokens.length) return;

  const notification = new apn.Notification();

  notification.title = title;
  notification.body = body;
  notification.badge = 1;
  notification.topic = config.bundleID;

  const res = await provider.send(notification, deviceTokens);

  for (let failure of res.failed) {
    const { device, error, status, response } = failure;

    if (error) {
      console.error(error);
      return;
    }

    if (response) {
      const { reason } = response;
      switch (reason) {
        case 'Unregistered':
          // Remove device token
          console.log(`Pulling device token ${device} from user ${user.username}`);
          await user.update({ $pull: { deviceTokens: device } });
          break;
        default:
          console.error(`Sending notifications failed for device ${device}. ${status}: ${reason}`);
      }
    }
  }
}

module.exports = send;
