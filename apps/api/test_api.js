const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function test() {
  const token = jwt.sign({
    id: 'cmqhwb3g80000csswjwuiz4la',
    email: 'admin@lightit.io',
    role: 'ADMIN'
  }, process.env.JWT_SECRET, { expiresIn: '15m' });

  try {
    const res = await axios.get('http://localhost:4000/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('SUCCESS:', Object.keys(res.data.data.stats));
  } catch (err) {
    console.error('ERROR:', err.response?.status, err.response?.data);
  }
}

test();
