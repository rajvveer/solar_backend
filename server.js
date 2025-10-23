const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const apiRoutes = require('./routes/apiRoutes');
const adminRoutes = require('./routes/adminRoutes'); 

dotenv.config();

const app = express();

app.use(cors({ origin: 'https://solaramb.netlify.app' }));

app.use(express.json());

app.use('/api', apiRoutes);

app.use('/api/admin', adminRoutes);

connectDB();
app.get('/health', (req, res) => {
  res.sendStatus(200);
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  require('./keepAlive'); // keeps server alive
});
