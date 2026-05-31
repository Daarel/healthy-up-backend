import { config } from 'dotenv';

import app from './app.js';

config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
