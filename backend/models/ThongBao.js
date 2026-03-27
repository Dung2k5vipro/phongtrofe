const { pool } = require('../config/db');

class ThongBao {
    static async findAll(filters) {
        let query = 'SELECT * FROM ThongBao WHERE 1=1';
        let params = [];
        
        if (filters && filters.nguoiChung) {
            // Null means sent to all, or match specific user
            query += ' AND (nguoiChung = ? OR nguoiChung IS NULL)';
            params.push(filters.nguoiChung);
        }
        if (filters && filters.loaiThongBao) {
            query += ' AND loaiThongBao = ?';
            params.push(filters.loaiThongBao);
        }

        query += ' ORDER BY ngayTao DESC';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM ThongBao WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { tieuDe, noiDung, loaiThongBao, nguoiChung, link } = data;
        
        const [result] = await pool.execute(
            `INSERT INTO ThongBao 
            (tieuDe, noiDung, loaiThongBao, nguoiChung, link, daDoc) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                tieuDe, noiDung, loaiThongBao || 'chung', 
                nguoiChung || null, link || null, 0
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
                values.push(value);
            }
        }
        
        if (fields.length === 0) return 0;
        
        values.push(id);
        const query = `UPDATE ThongBao SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        return result.affectedRows;
    }

    static async markAsRead(id) {
        const [result] = await pool.execute(
            'UPDATE ThongBao SET daDoc = 1 WHERE id = ?', 
            [id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM ThongBao WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = ThongBao;
