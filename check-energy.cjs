const { Client } = require("pg"); 
const client = new Client({ connectionString: "postgresql://aku-sparta:0hhUTvTHKtgkN8TfLadC@103.127.99.241:5432/energy?sslmode=disable" }); 
client.connect()
.then(() => client.query("SELECT * FROM users WHERE email = $1", ["agus.erwanto@sat.co.id"]))
.then(res => console.log("ROWS FOUND:", res.rows))
.catch(console.error)
.finally(() => client.end());
