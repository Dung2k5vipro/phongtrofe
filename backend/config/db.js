const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'phong_tro_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const checkConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối MySQL thành công (phong_tro_db)');
        connection.release();
    } catch (error) {
        console.error('❌ Lỗi kết nối MySQL:');
        console.error(error);
        process.exit(1);
    }
};

module.exports = {
    pool,
    checkConnection
};
