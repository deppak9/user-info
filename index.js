const express = require('express');
const axios = require('axios');
const useragent = require('useragent');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
var requestIp = require('request-ip');
const IP = require('ip');

const app = express();
const PORT = 3000;

app.set('trust proxy', true)
app.set('view engine', 'ejs');
app.use(express.static('public'));
const DeviceDetector = require('node-device-detector');
const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: true,
});

//app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  try {
    const ipAddress = IP.address();
    const ip2 = req.headers['x-forwarded-for'] ||req.socket.remoteAddress ||null;

    //const response2 = await axios.get('http://api.ipify.org?format=json');
    const ip = req.ip;
    var clientIp = requestIp.getClientIp(req);

    const response = await axios.get(`http://ip-api.com/json/${clientIp}`);
    const location = response.data;


    const userAgent = useragent.parse(req.headers['user-agent']);
    const result = detector.detect(req.headers['user-agent']);

    req.userInfo = {
      private_ip: ipAddress,
      public_ip: clientIp,
      ip2: ip2,
      device: JSON.stringify(result),
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
