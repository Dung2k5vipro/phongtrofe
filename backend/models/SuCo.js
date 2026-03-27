const { pool } = require('../config/db');

class SuCo {
    static async findAll(filters) {
        let query = 'SELECT s.*, p.maPhong, k.hoTen as tenNguoiBao FROM SuCo s LEFT JOIN Phong p ON s.phong_id = p.id LEFT JOIN KhachThue k ON s.nguoiBao_id = k.id WHERE 1=1';
        let params = [];
        
        if (filters && filters.trangThai) {
            query += ' AND s.trangThai = ?';
            params.push(filters.trangThai);
        }
        if (filters && filters.phong_id) {
            query += ' AND s.phong_id = ?';
            params.push(filters.phong_id);
        }

        query += ' ORDER BY s.ngayTao DESC';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT s.*, p.maPhong, k.hoTen as tenNguoiBao FROM SuCo s LEFT JOIN Phong p ON s.phong_id = p.id LEFT JOIN KhachThue k ON s.nguoiBao_id = k.id WHERE s.id = ?', 
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { tieuDe, moTa, hinhAnh, phong_id, nguoiBao_id, mucDo, trangThai } = data;
        
        const [result] = await pool.execute(
            `INSERT INTO SuCo 
            (tieuDe, moTa, hinhAnh, phong_id, nguoiBao_id, mucDo, trangThai) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                tieuDe, moTa, hinhAnh ? JSON.stringify(hinhAnh) : '[]', 
                phong_id, nguoiBao_id, mucDo || 'vua', trangThai || 'choXuLy'
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
                if (key === 'hinhAnh') {
                    values.push(JSON.stringify(value));
                } else {
                    values.push(value);
                }
            }
        }
        
        if (fields.length === 0) return 0;
        
        values.push(id);
        const query = `UPDATE SuCo SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM SuCo WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = SuCo;
