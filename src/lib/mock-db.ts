/**
 * @deprecated Tu March 2026, du lieu nghiep vu uu tien lay tu backend API that.
 * File nay chi giu lai de tham chieu trong giai doan chuyen doi.
 */
export let toaNhaList = [
  { _id: "1", tenToaNha: "Tòa A", diaChi: "Hà Nội" },
  { _id: "2", tenToaNha: "Tòa B", diaChi: "Hà Nội" },
  { _id: "3", tenToaNha: "Tòa C", diaChi: "Hà Nội" }
]

export let phongList = [
  {
    _id: "1",
    maPhong: "A101",
    toaNha: "1",
    tang: 1,
    dienTich: 25,
    giaThue: 2500000,
    tienCoc: 2500000,
    trangThai: "trong",
    soNguoiToiDa: 2,
    tienNghi: ["wifi","dieuhoa"],
    moTa: "Phòng đầy đủ tiện nghi",
    anhPhong: ["https://picsum.photos/400/300?1"]
  },
  {
    _id: "2",
    maPhong: "A102",
    toaNha: "1",
    tang: 1,
    dienTich: 30,
    giaThue: 3000000,
    tienCoc: 3000000,
    trangThai: "dangThue",
    soNguoiToiDa: 3,
    tienNghi: ["wifi","tulanh"],
    moTa: "Phòng rộng",
    anhPhong: ["https://picsum.photos/400/300?2"]
  },
  {
    _id: "3",
    maPhong: "B201",
    toaNha: "2",
    tang: 2,
    dienTich: 28,
    giaThue: 2800000,
    tienCoc: 2800000,
    trangThai: "trong",
    soNguoiToiDa: 2,
    tienNghi: ["wifi"],
    moTa: "Phòng mới",
    anhPhong: ["https://picsum.photos/400/300?3"]
  }
]

export let khachThueList = [
  {
    _id: "1",
    hoTen: "Nguyễn Văn A",
    soDienThoai: "0123456789"
  },
  {
    _id: "2",
    hoTen: "Trần Văn B",
    soDienThoai: "0988888888"
  },
  {
    _id: "3",
    hoTen: "Lê Văn C",
    soDienThoai: "0977777777"
  }
]

export let hopDongList = [
  {
    _id: "1",
    phongId: "2",
    khachThueId: [
      khachThueList[0],
      khachThueList[1]
    ],
    nguoiDaiDien: khachThueList[0],
    ngayBatDau: "2024-01-01",
    ngayKetThuc: "2025-01-01"
  }
]
