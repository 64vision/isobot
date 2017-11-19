var mysql = require('mysql');
//Database data
exports.DBconnect = function(mysql) {

	var DBconnect  = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'orbit_bacs123!',
	  database : 'isochat',
	  //socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
	});
	return DBconnect;
}

exports.mysqlDB = function() {
	return mysql;
}
