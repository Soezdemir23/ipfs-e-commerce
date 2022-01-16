const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');
const Express = require('express');
const BodyParser = require('body-parser');

const app = Express();
app.use(Express.static('./img'));
app.use(Express.static('./style'));
//defaults to true, but this method is deprecated
let urlencodedParser = BodyParser.urlencoded({ extended: false })

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//Apparently EVERYTHING async needs to be used in "main". "Main" it is.
async function main() {
    // Create IPFS instance
    const ipfsOptions = { repo: './ipfs', }
    const ipfs = await IPFS.create(ipfsOptions)

    // Create OrbitDB instance
    const orbitdb = await OrbitDB.createInstance(ipfs)

    const db = await orbitdb.keyvalue('e-mail-db');
    // take the db and add a new key value pair
    async function unpinnedAdd(db, key, value) {
        await db.put(key, value);
        console.log("Added to database");
        let keyhole = await db.get(key);
        console.log("Retrieved from database: " + keyhole);
    }

    app.post('/submit', urlencodedParser, (req, res) => {
        console.log('Got body:', req.body.email);
        unpinnedAdd(db, 'email', req.body.email);
        
    });

}

let db = main()

app.listen(3000);