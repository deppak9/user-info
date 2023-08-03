const express = require('express');
const axios = require('axios');
const useragent = require('useragent');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const IP = require('ip');

const app = express();
const PORT = 3000;

app.set('trust proxy', true)
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  try {
    const ipAddress = IP.address();
    const response2 = await axios.get('http://api.ipify.org?format=json');

    const { ip } = response2.data;
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const location = response.data;


    const userAgent = useragent.parse(req.headers['user-agent']);

    req.userInfo = {
      ip: ip,
      device: userAgent.device.toString(),
      os: userAgent.os.toString(),
      browser: userAgent.toAgent(),
      location: `${location.city}, ${location.regionName}, ${location.country}`
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    req.userInfo = {
      ip: ipAddress,
      device: 'Unknown',
      os: 'Unknown',
      browser: 'Unknown',
      location: 'Unknown'
    };
  }

  next();
});

app.get('/', (req, res) => {
  res.render('index', { userInfo: req.userInfo });
});

app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});