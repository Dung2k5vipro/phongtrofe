const { pool } = require('../config/db');

class Phong {
    static async findAll(filters) {
        let query = 'SELECT p.*, t.tenToaNha FROM Phong p LEFT JOIN ToaNha t ON p.toaNha_id = t.id WHERE 1=1';
        let params = [];

        if (filters.toaNha_id) {
            query += ' AND p.toaNha_id = ?';
            params.push(filters.toaNha_id);
        }
        if (filters.trangThai) {
            query += ' AND p.trangThai = ?';
            params.push(filters.trangThai);
        }
        if (filters.tang) {
            query += ' AND p.tang = ?';
            params.push(filters.tang);
        }

        query += ' ORDER BY p.ngayCapNhat DESC';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT p.*, t.tenToaNha FROM Phong p LEFT JOIN ToaNha t ON p.toaNha_id = t.id WHERE p.id = ?', 
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { maPhong, toaNha_id, tang, dienTich, giaThue, tienCoc, moTa, anhPhong, tienNghi, trangThai, soNguoiToiDa } = data;
        const [result] = await pool.execute(
            `INSERT INTO Phong 
            (maPhong, toaNha_id, tang, dienTich, giaThue, tienCoc, moTa, anhPhong, tienNghi, trangThai, soNguoiToiDa) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                maPhong, toaNha_id, tang, dienTich, giaThue, tienCoc, 
                moTa || null, 
                anhPhong ? JSON.stringify(anhPhong) : '[]', 
                tienNghi ? JSON.stringify(tienNghi) : '[]', 
                trangThai || 'trong', 
                soNguoiToiDa
            ]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                if (['anhPhong', 'tienNghi'].includes(key)) {
                    values.push(JSON.stringify(value));
                } else {
                    values.push(value);
                }
            }
        }
        
        if (fields.length === 0) return 0;
        
        values.push(id);
        const query = `UPDATE Phong SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM Phong WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Phong;
