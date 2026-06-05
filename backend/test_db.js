const mysql = require('mysql');
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'electronicsdb',
  connectionLimit: 10,
  multipleStatements: true,
});

const queries = [
  'select * from category limit 5;',
  'select * from productdetails limit 5;',
  'select * from banner limit 5;',
];

pool.query(queries.join('\n'), function(error, results) {
  if (error) {
    console.error('MySQL Query Error:', error);
  } else {
    console.log('Categories:', results[0]);
    console.log('Product Details:', results[1]);
    console.log('Banners:', results[2]);
  }
  process.exit();
});
