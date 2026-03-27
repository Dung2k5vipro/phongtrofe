const { pool } = require('../config/db');

class HoaDon {
    static async findAll(filters) {
        let query = 'SELECT hd.*, p.maPhong, k.hoTen as tenKhachThue FROM HoaDon hd LEFT JOIN Phong p ON hd.phong_id = p.id LEFT JOIN KhachThue k ON hd.khachThue_id = k.id WHERE 1=1';
        let params = [];
        
        if (filters && filters.trangThai) {
            query += ' AND hd.trangThai = ?';
            params.push(filters.trangThai);
        }
        if (filters && filters.hopDong_id) {
            query += ' AND hd.hopDong_id = ?';
            params.push(filters.hopDong_id);
        }
        if (filters && filters.thang && filters.nam) {
            query += ' AND hd.thang = ? AND hd.nam = ?';
            params.push(filters.thang, filters.nam);
        }
        
        query += ' ORDER BY hd.nam DESC, hd.thang DESC, hd.ngayTao DESC';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT hd.*, p.maPhong, k.hoTen as tenKhachThue FROM HoaDon hd LEFT JOIN Phong p ON hd.phong_id = p.id LEFT JOIN KhachThue k ON hd.khachThue_id = k.id WHERE hd.id = ?', 
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { 
            maHoaDon, hopDong_id, phong_id, khachThue_id, thang, nam,
            tienPhong, tienDien, soDien, chiSoDienBanDau, chiSoDienCuoiKy,
            tienNuoc, soNuoc, chiSoNuocBanDau, chiSoNuocCuoiKy,
            phiDichVu, tongTien, daThanhToan, conLai, trangThai,
            hanThanhToan, ghiChu
        } = data;
        
        const [result] = await pool.execute(
            `INSERT INTO HoaDon 
            (maHoaDon, hopDong_id, phong_id, khachThue_id, thang, nam,
             tienPhong, tienDien, soDien, chiSoDienBanDau, chiSoDienCuoiKy,
             tienNuoc, soNuoc, chiSoNuocBanDau, chiSoNuocCuoiKy,
             phiDichVu, tongTien, daThanhToan, conLai, trangThai,
             hanThanhToan, ghiChu) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                maHoaDon, hopDong_id, phong_id, khachThue_id, thang, nam,
                tienPhong, tienDien, soDien, chiSoDienBanDau, chiSoDienCuoiKy,
                tienNuoc, soNuoc, chiSoNuocBanDau, chiSoNuocCuoiKy,
                phiDichVu ? JSON.stringify(phiDichVu) : '[]', 
                tongTien, daThanhToan || 0, conLai, 
                trangThai || 'chuaThanhToan', 
                new Date(hanThanhToan).toISOString().split('T')[0], 
                ghiChu || null
            ]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        
        // Logical processing for conLai and trangThai
        let daThanhToan = data.daThanhToan;
        let tongTien = data.tongTien;
        let conLai = data.conLai;

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                if (key === 'phiDichVu') {
                    values.push(JSON.stringify(value));
                } else if (key === 'hanThanhToan') {
                    values.push(new Date(value).toISOString().split('T')[0]);
                } else {
                    values.push(value);
                }
            }
        }
        
        if (fields.length === 0) return 0;
        
        values.push(id);
        const query = `UPDATE HoaDon SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM HoaDon WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = HoaDon;
