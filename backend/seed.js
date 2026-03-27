const bcrypt = require('bcryptjs');
const { pool } = require('./config/db');

// Import các models
const NguoiDung = require('./models/NguoiDung');
const ToaNha = require('./models/ToaNha');
const Phong = require('./models/Phong');
const KhachThue = require('./models/KhachThue');
const HopDong = require('./models/HopDong');
const SuCo = require('./models/SuCo');
const ThongBao = require('./models/ThongBao');

async function seedDatabase() {
    try {
        console.log('Bắt đầu thêm dữ liệu mẫu...');
        const connection = await pool.getConnection();

        // 1. Tạo Người Dùng (Admin & Chủ nhà)
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const chuNhaPassword = await bcrypt.hash('chunha123', salt);

        await connection.execute(`INSERT INTO NguoiDung (ten, email, matKhau, soDienThoai, vaiTro, trangThai) VALUES 
            ('Admin Hệ Thống', 'admin@phongtro.com', ?, '0123456789', 'admin', 'hoatDong'),
            ('Chủ Nhà Mẫu 1', 'chunha@phongtro.com', ?, '0987654321', 'chuNha', 'hoatDong')`,
            [adminPassword, chuNhaPassword]);

        console.log('✅ Đã thêm Người dùng.');

        // Lấy ID chủ nhà
        const [users] = await connection.execute("SELECT id FROM NguoiDung WHERE vaiTro = 'chuNha' LIMIT 1");
        const chuNhaId = users[0].id;

        // 2. Tạo Tòa Nhà
        const [toaNhaRes] = await connection.execute(
            `INSERT INTO ToaNha (tenToaNha, soNha, duong, phuong, quan, thanhPho, tongSoPhong, chuSoHuu_id, anhToaNha, tienNghiChung) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Tòa Nhà Alpha', '123', 'Lê Lợi', 'Phường 1', 'Quận 1', 'TP.HCM', 10, chuNhaId,
                '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80"]',
                '["wifi", "cameranninh", "thangmay"]']
        );
        const toaNhaId = toaNhaRes.insertId;
        console.log('✅ Đã thêm Tòa nhà.');

        // 3. Tạo Phòng
        await connection.execute(
            `INSERT INTO Phong (maPhong, toaNha_id, tang, dienTich, giaThue, tienCoc, soNguoiToiDa, trangThai, anhPhong, tienNghi) 
            VALUES 
            ('P101', ?, 1, 20, 3000000, 3000000, 2, 'trong', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80"]', '["dieuhoa", "nonglanh", "giuong"]'),
            ('P102', ?, 1, 25, 3500000, 3500000, 3, 'dangThue', '["https://images.unsplash.com/photo-1502672260266-1c1de2d93688?w=500&q=80"]', '["dieuhoa", "nonglanh", "tulanh", "giuong"]'),
            ('P201', ?, 2, 30, 4500000, 4500000, 4, 'daDat', '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&q=80"]', '["dieuhoa", "nonglanh", "maygiat", "bep"]')`,
            [toaNhaId, toaNhaId, toaNhaId]
        );
        const [phongDangThue] = await connection.execute("SELECT id FROM Phong WHERE maPhong = 'P102' LIMIT 1");
        const phongId = phongDangThue[0].id;
        if (!phongId) throw new Error("phongId undefined");
        console.log('✅ Đã thêm Phòng.');

        // 4. Tạo Khách Thuê
        const [khachThueRes] = await connection.execute(
            `INSERT INTO KhachThue (hoTen, soDienThoai, cccd, email, ngaySinh, gioiTinh, queQuan, anhCCCD_matTruoc, anhCCCD_matSau, trangThai) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Nguyễn Văn An', '0911223344', '001099002233', 'an.nguyen@example.com', '1995-10-15', 'nam', 'Hà Nội', 'mat_truoc.jpg', 'mat_sau.jpg', 'dangThue']
        );
        const khachThueId = khachThueRes.insertId;
        console.log('✅ Đã thêm Khách thuê.');

        // 5. Tạo Hợp Đồng (Cho P102)
        const ngayBatDau = new Date().toISOString().split('T')[0];
        const ngayKetThuc = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

        const ngayThanhToan = 5;
        const dieuKhoan = 'Thanh toán đúng hạn, giữ gìn tài sản, không gây ồn ào';

        const [hopDongRes] = await connection.execute(
            `INSERT INTO HopDong (
        maHopDong,
        phong_id,
        nguoiDaiDien_id,
        ngayBatDau,
        ngayKetThuc,
        giaThue,
        tienCoc,
        chuKyThanhToan,
        ngayThanhToan,
        dieuKhoan,
        giaDien,
        giaNuoc,
        chiSoDienBanDau,
        chiSoNuocBanDau,
        phiDichVu,
        trangThai
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                `HD-${Date.now()}`,
                phongId,
                khachThueId,
                ngayBatDau,
                ngayKetThuc,
                3500000,
                3500000,
                'thang',
                ngayThanhToan,
                dieuKhoan,
                3500,
                20000,
                100,
                50,
                '[{"ten": "Rác", "gia": 50000}]',
                'hoatDong'
            ]
        );

        const hopDongId = hopDongRes.insertId;

        // Link hợp đồng - khách thuê phụ
        await connection.execute(
            'INSERT INTO HopDong_KhachThue (hopDong_id, khachThue_id) VALUES (?, ?)',
            [hopDongId, khachThueId]
        );

        console.log('✅ Đã thêm Hợp đồng.');


        // 6. Tạo Sự cố (FIX ENUM)
        await connection.execute(
            `INSERT INTO SuCo (tieuDe, moTa, phong_id, nguoiBao_id, mucDo, trangThai, hinhAnh) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                'Hỏng điều hòa',
                'Điều hòa không mát, chỉ thổi gió',
                phongId,
                khachThueId,
                'vua', // ✅ FIX: không dùng 'cao'
                'choXuLy',
                '[]'
            ]
        );

        console.log('✅ Đã thêm Sự cố.');

        // 7. Tạo Thông Báo
        await connection.execute(
            `INSERT INTO ThongBao (tieuDe, noiDung, loaiThongBao) 
            VALUES (?, ?, ?)`,
            ['Lịch thu tiền điện nước tháng này', 'Vui lòng thanh toán tiền điện nước và tiền phòng trước ngày 05 hàng tháng.', 'chung']
        );
        console.log('✅ Đã thêm Thông báo.');

        connection.release();
        console.log('🎉 Đã seed dữ liệu mẫu thành công!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi seed dữ liệu:', error);
        process.exit(1);
    }
}

seedDatabase();
