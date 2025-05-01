var sql = require("pg");

// config for your database
var config = {
    user: 'postgres',
    password: '123456',
    host: 'localhost', 
    port: 5432,
    database: 'toeic',
};    
const poolPromise = new sql.Pool(config)
  .connect()
  .then(pool => {
    console.log('Connected to PostgresSQL')
    return pool
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {
  sql, poolPromise
}
