var User = require('../models/user');

var Authenticator = async function(req, res) {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [email_address, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    var users = await User.findAll({
      where: {
        email_address: email_address,
        password: password
      },
      limit: 1
    }).catch((error) => { });
    if (users && users[0]) {
      // Access granted...
      return { isSuccess: true, user: users[0] };
    }
  
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
    return { isSuccess: false };
}

module.exports = Authenticator;
