const { pool } = require('../config/db');

class KhachThue {
    static async findAll(filters) {
        let query = 'SELECT * FROM KhachThue WHERE 1=1';
        let params = [];
        
        if (filters && filters.trangThai) {
            query += ' AND trangThai = ?';
            params.push(filters.trangThai);
        }
        
        query += ' ORDER BY ngayCapNhat DESC';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM KhachThue WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByCCCD(cccd) {
        const [rows] = await pool.execute('SELECT * FROM KhachThue WHERE cccd = ?', [cccd]);
        return rows[0];
    }
    
    static async findByPhone(soDienThoai) {
        const [rows] = await pool.execute('SELECT * FROM KhachThue WHERE soDienThoai = ?', [soDienThoai]);
        return rows[0];
    }

    static async create(data) {
        const { hoTen, soDienThoai, email, cccd, ngaySinh, gioiTinh, queQuan, anhCCCD_matTruoc, anhCCCD_matSau, ngheNghiep, trangThai } = data;
        
        // Cần đảm bảo ngày tháng đúng format 'YYYY-MM-DD'
        let formattedNgaySinh = null;
        if (ngaySinh) {
            formattedNgaySinh = new Date(ngaySinh).toISOString().split('T')[0];
        }

        const [result] = await pool.execute(
            `INSERT INTO KhachThue 
            (hoTen, soDienThoai, email, cccd, ngaySinh, gioiTinh, queQuan, anhCCCD_matTruoc, anhCCCD_matSau, ngheNghiep, trangThai) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                hoTen, soDienThoai, email || null, cccd, formattedNgaySinh, gioiTinh, queQuan, 
                anhCCCD_matTruoc || null, anhCCCD_matSau || null, ngheNghiep || null, 
                trangThai || 'chuaThue'
            ]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && key !== 'matKhau') {
                fields.push(`${key} = ?`);
                if (key === 'ngaySinh') {
                    values.push(new Date(value).toISOString().split('T')[0]);
                } else {
                    values.push(value);
                }
            }
        }
        
        if (fields.length === 0) return 0;
        
        values.push(id);
        const query = `UPDATE KhachThue SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM KhachThue WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = KhachThue;
