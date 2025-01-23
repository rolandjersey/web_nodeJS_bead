const mysql = require('mysql');

// MySQL kapcsolat létrehozása 

  
db.connect((err) => {
  if (err) {
    console.error('Hiba az adatbázishoz való csatlakozáskor: ' + err.stack);
    return;
  }
  console.log('Sikeres csatlakozás az adatbázishoz.');
});