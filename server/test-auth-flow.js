const http = require('http');

async function doRequest(path, method, data, cookies) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    
    if (cookies) {
        options.headers['Cookie'] = cookies;
    }

    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });

    req.on('error', e => reject(e));

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testFlow() {
  const email = `test_${Date.now()}@test.com`;
  const password = "TestPass123";
  const userName = `testuser_${Date.now()}`;
  
  console.log("=== Testing Registration ===");
  const regData = JSON.stringify({ userName, email, password });
  const regRes = await doRequest('/api/auth/register', 'POST', regData);
  console.log(`Status: ${regRes.status}`);
  console.log(`Body: ${regRes.body}`);

  console.log("\n=== Testing Login ===");
  const loginData = JSON.stringify({ email, password });
  const loginRes = await doRequest('/api/auth/login', 'POST', loginData);
  console.log(`Status: ${loginRes.status}`);
  console.log(`Body: ${loginRes.body}`);
  
  let cookies = loginRes.headers['set-cookie'];
  if (cookies) {
      cookies = cookies[0].split(';')[0]; // Extract the token cookie
  }

  console.log("\n=== Testing Check Auth ===");
  const authRes = await doRequest('/api/auth/check-auth', 'GET', null, cookies);
  console.log(`Status: ${authRes.status}`);
  console.log(`Body: ${authRes.body}`);
}

testFlow().catch(console.error);
