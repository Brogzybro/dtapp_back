const testlib = require('../_helpers/jobstestlib');
const SharedUser = require('../../models/shared_user_model');

describe('', () => {
  beforeEach(() => {
    // setup memory db and stuff
    testlib.setup();
  });
  afterEach(() => {
    // cleanup db and stuff
    testlib.after();
  });
  it('shared user should be empty', async done => {
    // do something
    const sharedUsers = await SharedUser.find();
    expect(sharedUsers.length).toBe(0);
    done();
  });
});
