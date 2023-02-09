import connection from "../config/connectDB";

let getHomepage = (req, res) => {

    let data = [];
    // simple query
    connection.query(
        'SELECT * FROM `user`',
        function (err, results, fields) {
            console.log(results); // results contains rows returned by server
            data = results;
            return res.render('index.ejs', { dataUser: JSON.stringify(data) });
        }

    );

}

module.exports = {
    getHomepage
}