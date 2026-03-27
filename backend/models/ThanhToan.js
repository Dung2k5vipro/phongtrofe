const { pool } = require('../config/db');

class ThanhToan {
    static async findAll(filters) {
        let query = 'SELECT t.*, hd.maHoaDon, n.ten as tenNguoiNhan FROM ThanhToan t LEFT JOIN HoaDon hd ON t.hoaDon_id = hd.id LEFT JOIN NguoiDung n ON t.nguoiNhan_id = n.id WHERE 1=1';
        let params = [];
        
        if (filters && filters.hoaDon_id) {
            query += ' AND t.hoaDon_id = ?';
            params.push(filters.hoaDon_id);
        }
        
        query += ' ORDER BY t.ngayThanhToan DESC';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT t.*, hd.maHoaDon, n.ten as tenNguoiNhan FROM ThanhToan t LEFT JOIN HoaDon hd ON t.hoaDon_id = hd.id LEFT JOIN NguoiDung n ON t.nguoiNhan_id = n.id WHERE t.id = ?', 
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { hoaDon_id, soTien, phuongThuc, thongTinChuyenKhoan_nganHang, thongTinChuyenKhoan_soGiaoDich, ngayThanhToan, nguoiNhan_id, ghiChu, anhBienLai } = data;
        
        const [result] = await pool.execute(
            `INSERT INTO ThanhToan 
            (hoaDon_id, soTien, phuongThuc, thongTinChuyenKhoan_nganHang, thongTinChuyenKhoan_soGiaoDich, 
             ngayThanhToan, nguoiNhan_id, ghiChu, anhBienLai) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                hoaDon_id, soTien, phuongThuc, 
                thongTinChuyenKhoan_nganHang || null, thongTinChuyenKhoan_soGiaoDich || null, 
                ngayThanhToan ? new Date(ngayThanhToan).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19), 
                nguoiNhan_id, 
                ghiChu || null, anhBienLai || null
            ]
        );
        return result.insertId;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM ThanhToan WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = ThanhToan;
