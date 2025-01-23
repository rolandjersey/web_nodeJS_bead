const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { render } = require('ejs');

const app = express();
// const db = require('./adatbazis'); // Adatbázis modul importálása

/*
db.query("SELECT * FROM eurovision_events", (err, res) => {
    if (err) throw err;
    console.log(res);
});*/
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port:'3306',
    password: '',
    database: 'eurovisiondb'
});
db.connect();

// Alkalmazás beállításai
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json()); // JSON body parser
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Főoldal
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// Kapcsolat oldal
app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Kapcsolat' });
});

// CRUD műveletek a languages táblával
app.get('/crud', (req, res) => {
    db.query('SELECT * FROM languages', (error, results) => {
        if (error) throw error;
        res.render('crud', { records: results });
    });
});

app.get('/get_record/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM languages WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Hiba történt az adatbázis lekérdezése során.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Rekord nem található.' });
        }
        res.json(results[0]);
    });
});

app.post('/create_record', (req, res) => {
    const { country, language } = req.body;
    
    const query = 'INSERT INTO languages (country, language) VALUES (?, ?)';
    db.query(query, [country, language], (err) => {
        if (err) throw err;        
        res.status(201);
    });
});

app.post('/update_record/:id', (req, res) => {
    const { id } = req.params;
    const { country, language } = req.body;
    
    const query = 'UPDATE languages SET country = ?, language = ? WHERE id = ?';
    db.query(query, [country, language, id], (err) => {
        if (err) throw err;        
        res.redirect('/crud');
    });
});

app.delete('/delete_record/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM languages WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) throw err;
        res.redirect('/crud');
    });
});

// Adatok megjelenítése az adatbázisból
app.get('/database', (req, res) => {
    const songQuery = 'SELECT * FROM eurovision_songs LIMIT 10';
    const eventQuery = 'SELECT * FROM eurovision_events LIMIT 10';
    const langQuery = 'SELECT * FROM languages LIMIT 10';

    db.query(songQuery, (err, songResults) => {
        if (err) {
            console.error('Error fetching songs:', err);
            return res.status(500).send('Hiba történt a dalok lekérdezése során.');
        }

        db.query(eventQuery, (err, eventResults) => {
            if (err) {
                console.error('Error fetching events:', err);
                return res.status(500).send('Hiba történt az események lekérdezése során.');
            }

            db.query(langQuery, (err, langResults) => {
                if (err) {
                    console.error('Error fetching languages:', err);
                    return res.status(500).send('Hiba történt a nyelvek lekérdezése során.');
                }

                // Renderelés az EJS sablonra
                res.render('database', {
                    songs: songResults,
                    events: eventResults,
                    languages: langResults
                });
            });
        });
    });
});

// Üzenetek kezelése
app.get('/messages', (req, res) => {
    const sql = 'SELECT * FROM messages ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('messages', { title: 'Üzenetek', uzenetek: results });
    });
});

app.post('/send_message', (req, res) => {
    const { name, email, message } = req.body;
    const sql = 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)';    
    db.query(sql, [name, email, message], (err) => {
        if (err) throw err;
        res.redirect('/messages');
    });
});

// OOP oldal
app.get('/oop', (req, res) => {
    res.render('oop', { title: 'OOP Javascript' });
});

// Szerver indítása
const port = 8021;
app.listen(port, () => {    
    console.log(`Server running at http://localhost:${port}`);
});
