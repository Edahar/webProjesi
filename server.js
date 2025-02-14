// Gerekli modülleri yükle
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors()); // CORS hatalarını engellemek için

// Veritabanı bağlantısı
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Veritabanı kullanıcı adınız
    password: '1234', // Veritabanı şifreniz
    database: 'arac_yonetim' // Veritabanınızın adı
});

// Veritabanı bağlantısını kontrol et
db.connect((err) => {
    if (err) {
        console.error('Veritabanına bağlanılamadı:', err.stack);
        return;
    }
    console.log('Veritabanına bağlanıldı!');
});

// Araç ekleme API'si
app.post('/add-car', (req, res) => {
    const { carName, carModel, carYear } = req.body;

    // SQL sorgusu ile veritabanına ekleme yapalım
    const query = 'INSERT INTO araclar (car_name, car_model, car_year) VALUES (?, ?, ?)';

    db.query(query, [carName, carModel, carYear], (err, results) => {
        if (err) {
            console.error('Veri eklenirken hata oluştu:', err);
            return res.status(500).send('Bir hata oluştu');
        }
        res.status(200).send('Araç başarıyla eklendi!');
    });
});

// Araç güncelleme API'si
app.put('/update-car/:id', (req, res) => {
    const { id } = req.params;
    const { carName, carModel, carYear } = req.body;

    // Güncelleme sorgusu
    const query = 'UPDATE araclar SET car_name = ?, car_model = ?, car_year = ? WHERE id = ?';

    db.query(query, [carName, carModel, carYear, id], (err, results) => {
        if (err) {
            console.error('Veri güncellenirken hata oluştu:', err);
            return res.status(500).send('Bir hata oluştu');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Belirtilen ID ile araç bulunamadı');
        }
        res.status(200).send('Araç başarıyla güncellendi!');
    });
});

// Araç silme API'si
app.delete('/delete-car/:id', (req, res) => {
    const { id } = req.params;

    // Silme sorgusu
    const query = 'DELETE FROM araclar WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Veri silinirken hata oluştu:', err);
            return res.status(500).send('Bir hata oluştu');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Belirtilen ID ile araç bulunamadı');
        }
        res.status(200).send('Araç başarıyla silindi!');
    });
});

// Tüm araçları listeleme API'si
app.get('/list-cars', (req, res) => {
    const query = 'SELECT * FROM araclar';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Veriler alınırken hata oluştu:', err);
            return res.status(500).send('Bir hata oluştu');
        }
        res.status(200).json(results);
    });
});

// ID'ye göre tek bir araç getirme API'si
app.get('/get-car/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM araclar WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Veri alınırken hata oluştu:', err);
            return res.status(500).send('Bir hata oluştu');
        }
        if (results.length === 0) {
            return res.status(404).send('Belirtilen ID ile araç bulunamadı');
        }
        res.status(200).json(results[0]);
    });
});

// Araç arama API'si
app.get('/search-cars', (req, res) => {
    const { keyword } = req.query;
    const query = `
        SELECT * FROM araclar 
        WHERE car_name LIKE ? 
        OR car_model LIKE ? 
        OR car_year LIKE ?
    `;
    const searchTerm = `%${keyword}%`;

    db.query(query, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Arama yapılırken hata oluştu:', err);
            return res.status(500).send('Bir hata oluştu');
        }
        res.status(200).json(results);
    });
});

// Modele göre araç filtreleme API'si
app.get('/filter-by-model/:model', (req, res) => {
    const { model } = req.params;
    const query = 'SELECT * FROM araclar WHERE car_model = ?';

    db.query(query, [model], (err, results) => {
        if (err) {
            console.error('Filtreleme yapılırken hata oluştu:', err);
            return res.status(500).send('Bir hata oluştu');
        }
        res.status(200).json(results);
    });
});

// Yıla göre araç filtreleme API'si
app.get('/filter-by-year/:year', (req, res) => {
    const { year } = req.params;
    const query = 'SELECT * FROM araclar WHERE car_year = ?';

    db.query(query, [year], (err, results) => {
        if (err) {
            console.error('Filtreleme yapılırken hata oluştu:', err);
            return res.status(500).send('Bir hata oluştu');
        }
        res.status(200).json(results);
    });
});

// Sunucu çalıştırma
app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
});