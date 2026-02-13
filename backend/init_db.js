const db = require('./database');

setTimeout(() => {
    console.log('Initialization check complete.');
    // Check if tables exist
    db.serialize(() => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
            if (err) {
                console.error(err.message);
                process.exit(1);
            }
            console.log('Tables:', tables);
            db.close();
        });
    });
}, 1000);
