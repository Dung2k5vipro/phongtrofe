const { pool } = require('../config/db');

class HopDong {
    static async findAll(filters) {
        let query = 'SELECT h.*, p.maPhong, k.hoTen as tenNguoiDaiDien FROM HopDong h LEFT JOIN Phong p ON h.phong_id = p.id LEFT JOIN KhachThue k ON h.nguoiDaiDien_id = k.id WHERE 1=1';
        let params = [];
        
        if (filters && filters.trangThai) {
            query += ' AND h.trangThai = ?';
            params.push(filters.trangThai);
        }
        if (filters && filters.phong_id) {
            query += ' AND h.phong_id = ?';
            params.push(filters.phong_id);
        }
        
        query += ' ORDER BY h.ngayTao DESC';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT h.*, p.maPhong, k.hoTen as tenNguoiDaiDien FROM HopDong h LEFT JOIN Phong p ON h.phong_id = p.id LEFT JOIN KhachThue k ON h.nguoiDaiDien_id = k.id WHERE h.id = ?', 
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { 
            maHopDong, phong_id, nguoiDaiDien_id, ngayBatDau, ngayKetThuc, 
            giaThue, tienCoc, chuKyThanhToan, ngayThanhToan, dieuKhoan, 
            giaDien, giaNuoc, chiSoDienBanDau, chiSoNuocBanDau, 
            phiDichVu, trangThai, fileHopDong, khachThueIds 
        } = data;
        
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.execute(
                `INSERT INTO HopDong 
                (maHopDong, phong_id, nguoiDaiDien_id, ngayBatDau, ngayKetThuc, 
                 giaThue, tienCoc, chuKyThanhToan, ngayThanhToan, dieuKhoan, 
                 giaDien, giaNuoc, chiSoDienBanDau, chiSoNuocBanDau, 
                 phiDichVu, trangThai, fileHopDong) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    maHopDong, phong_id, nguoiDaiDien_id, ngayBatDau, ngayKetThuc,
                    giaThue, tienCoc, chuKyThanhToan || 'thang', ngayThanhToan, dieuKhoan,
                    giaDien, giaNuoc, chiSoDienBanDau, chiSoNuocBanDau,
                    phiDichVu ? JSON.stringify(phiDichVu) : '[]', 
                    trangThai || 'hoatDong', fileHopDong || null
                ]
            );
            const hopDongId = result.insertId;

            // Thêm vào bảng phụ HopDong_KhachThue
            if (khachThueIds && Array.isArray(khachThueIds)) {
                for (let kId of khachThueIds) {
                    await connection.execute(
                        'INSERT INTO HopDong_KhachThue (hopDong_id, khachThue_id) VALUES (?, ?)',
                        [hopDongId, kId]
                    );
                }
            }

            // Cập nhật trạng thái phòng thành 'dangThue'
            if (trangThai !== 'daHuy' && trangThai !== 'hetHan') {
                await connection.execute(
                    'UPDATE Phong SET trangThai = ? WHERE id = ?',
                    ['dangThue', phong_id]
                );
            }

            await connection.commit();
            return hopDongId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && key !== 'khachThueIds') {
                fields.push(`${key} = ?`);
                if (key === 'phiDichVu') {
                    values.push(JSON.stringify(value));
                } else if (key === 'ngayBatDau' || key === 'ngayKetThuc') {
                    values.push(new Date(value).toISOString().split('T')[0]);
                } else {
                    values.push(value);
                }
            }
        }
        
        if (fields.length === 0) return 0;
        
        values.push(id);
        const query = `UPDATE HopDong SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.execute(query, values);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM HopDong WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = HopDong;
