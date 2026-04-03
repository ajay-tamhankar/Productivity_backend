const bcrypt = require('bcryptjs');
const hash = '$2b$10$XeWFHeROZVS97IFcK0FeROOn5V5jC0X4f8ugjzEw74WWmya10ri06';
const password = 'ChangeMe123!';

bcrypt.compare(password, hash, (err, res) => {
  if (res) {
    console.log('Match found! The password is: ' + password);
  } else {
    console.log('No match for ChangeMe123!');
  }
});
