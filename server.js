const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const apiRoutes = require('./routes/apiRoutes');
const adminRoutes = require('./routes/adminRoutes'); 

dotenv.config();

const app = express();

app.use(cors({ origin: 'https://loquacious-biscuit-720b4a.netlify.app/' }));

app.use(express.json());

app.use('/api', apiRoutes);

app.use('/api/admin', adminRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
