const {Client} = require('pg'); 
const c = new Client({connectionString: 'postgresql://aku-sparta:0hhUTvTHKtgkN8TfLadC@103.127.99.241:5432/energy?sslmode=disable'}); 
c.connect()
.then(() => c.query('SELECT s.id, s.token, s.expires_at, s.created_at, u.email FROM session s JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC LIMIT 5'))
.then(r => console.log(JSON.stringify(r.rows, null, 2)))
.catch(console.error)
.finally(() => c.end());
