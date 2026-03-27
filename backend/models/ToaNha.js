const { pool } = require('../config/db');

class ToaNha {
    static async findAll(chuSoHuu_id) {
        let query = 'SELECT * FROM ToaNha';
        let params = [];
        if (chuSoHuu_id) {
            query += ' WHERE chuSoHuu_id = ?';
            params.push(chuSoHuu_id);
        }
        query += ' ORDER BY ngayCapNhat DESC';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM ToaNha WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { tenToaNha, soNha, duong, phuong, quan, thanhPho, moTa, anhToaNha, chuSoHuu_id, tongSoPhong, tienNghiChung } = data;
        const [result] = await pool.execute(
            `INSERT INTO ToaNha 
            (tenToaNha, soNha, duong, phuong, quan, thanhPho, moTa, anhToaNha, chuSoHuu_id, tongSoPhong, tienNghiChung) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tenToaNha, soNha, duong, phuong, quan, thanhPho, 
                moTa || null, 
                anhToaNha ? JSON.stringify(anhToaNha) : '[]', 
                chuSoHuu_id, 
                tongSoPhong || 0, 
                tienNghiChung ? JSON.stringify(tienNghiChung) : '[]'
            ]
        );
        return result.insertId;
    }

    static async update(id, data) {
        // Chỉ update các trường có dữ liệu
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                if (['anhToaNha', 'tienNghiChung'].includes(key)) {
                    values.push(JSON.stringify(value));
                } else {
                    values.push(value);
                }
            }
        }
        
        if (fields.length === 0) return 0;
        
        values.push(id);
        const query = `UPDATE ToaNha SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM ToaNha WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = ToaNha;
