const fs = require('fs');
const path = require('path');

const pendingUserPath = path.join(__dirname, 'models', 'PendingUser.js');
if (fs.existsSync(pendingUserPath)) {
  fs.unlinkSync(pendingUserPath);
  console.log('PendingUser.js deleted successfully.');
} else {
  console.log('PendingUser.js does not exist.');
}
