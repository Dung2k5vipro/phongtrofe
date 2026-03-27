const { pool } = require('../config/db');

class NguoiDung {
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM NguoiDung WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM NguoiDung WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async create(userData) {
        const { ten, email, matKhau, soDienThoai, vaiTro, trangThai, diaChi } = userData;
        const [result] = await pool.execute(
            `INSERT INTO NguoiDung 
            (ten, email, matKhau, soDienThoai, vaiTro, trangThai, diaChi) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [ten, email, matKhau, soDienThoai, vaiTro || 'nhanVien', trangThai || 'hoatDong', diaChi || null]
        );
        return result.insertId;
    }

    static async updateLastLogin(id) {
        await pool.execute(
            'UPDATE NguoiDung SET lastLogin = NOW() WHERE id = ?',
            [id]
        );
    }
}

module.exports = NguoiDung;
