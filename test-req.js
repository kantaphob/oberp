const http = require('http');

async function testFetch() {
  const payload = {
    username: 'testu' + Date.now(),
    email: 'test' + Date.now() + '@test.com',
    password: 'password123',
    status: 'ACTIVE',
    roleId: '', 
    firstName: 'Test',
    lastName: 'User',
    taxId: '1234567890123',
    telephoneNumber: '0812345678',
    addressDetail: '123 Test St',
    isAdmin: true
  };

  // Get valid role
  const getOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/jobroles',
    method: 'GET'
  };

  const getReq = http.request(getOptions, (res) => {
    let rawData = '';
    res.on('data', chunk => rawData += chunk);
    res.on('end', () => {
      const roles = JSON.parse(rawData);
      if(roles.length === 0) {
         console.log("No roles");
         return;
      }
      payload.roleId = roles[0].id;

      // Make POST
      const postOptions = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/users',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(payload))
          }
      };

      const postReq = http.request(postOptions, (res2) => {
          let rawData2 = '';
          res2.on('data', chunk => rawData2 += chunk);
          res2.on('end', () => console.log(rawData2));
      });
      postReq.on('error', e => console.log("Post req error", e));
      postReq.write(JSON.stringify(payload));
      postReq.end();
    });
  });
  getReq.end();
}
testFetch();
