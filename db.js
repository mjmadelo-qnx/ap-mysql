const TAG = '[DB]';
const mysql = require('mysql');
require('dotenv').config()

/* for localhost mysql database */
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  name: process.env.DB_NAME || '',
  port: process.env.DB_PORT || '3306'
};

if (process.env.DB_SSL === 'true') {
  Object.assign({}, config, { ssl: process.env.DB_SSL_KEY });
}

const state = {
  pool: null
};

module.exports.connect = function(done) {
  let pool_options = {
    connectionLimit: 100,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.name,
    port: config.port
  };

  if (config.ssl) {
    pool_options = {
      ...pool_options,
      ssl: {
        ca: config.ssl
      }
    };
  }

  state.pool = mysql.createPool(pool_options);

  return new Promise((resolve, reject) => {
    let conn = execute('Select version()', []);
    conn
      .then(data => {
        console.log('info', `${TAG}[connect]`, data);
        resolve(data);
      })
      .catch(error => {
        console.log('error', `${TAG}[connect]`, error);
        reject(error);
      });
  });
};

module.exports.get = function(callback) {
  return state.pool;
};

function execute(sql, param) {
  return new Promise((resolve, reject) => {
    state.pool.getConnection(function(error, connection) {
      if (error) {
        console.log('error', `${TAG}[execute]`, error);
        reject(error);
      } else {
        connection.query(sql, param, function(err, rows) {
          connection.release();
          if (!err) {
            let data = JSON.parse(JSON.stringify(rows));
            // Mask if password field was found
            if (Array.isArray(data) && data.length > 0) {
              if (data[0].hasOwnProperty('password')) {
                console.log('info', `${TAG}[execute]`, {
                  ...data[0],
                  password: '********'
                });  
              } else {
                console.log('info', `${TAG}[execute]`, data);
              }
            }
            resolve(data);
          } else {
            console.log('error', `${TAG}[execute]`, err);
            reject(err);
          }
        });

        connection.on('error', function(err) {
          connection.release();
          console.log('error', `${TAG}[execute]`, err);
          reject(err);
        });
      }
    });
  });
}

module.exports.execute = execute;