// get the client
import mysql from 'mysql2'

// create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'nodejsbasic'
});




// with placeholder
/*
connection.query(
    'SELECT * FROM `table` WHERE `name` = ? AND `age` > ?',
    ['Page', 45],
    function (err, results) {
        console.log(results);
    }
);
*/
export default connection;