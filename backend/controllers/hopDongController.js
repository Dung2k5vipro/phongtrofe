const HopDong = require('../models/HopDong');
const { successResponse, errorResponse } = require('../common/response');

exports.getAllHopDong = async (req, res) => {
    try {
        const filters = {
            trangThai: req.query.trangThai,
            phong_id: req.query.phong_id
        };
        const hopDongs = await HopDong.findAll(filters);
        return successResponse(res, 'Lấy danh sách hợp đồng thành công', hopDongs);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Lấy danh sách hợp đồng thất bại');
    }
};

exports.getHopDongById = async (req, res) => {
    try {
        const hopDong = await HopDong.findById(req.params.id);
        if (!hopDong) {
            return errorResponse(res, 404, 'Không tìm thấy hợp đồng');
        }
        return successResponse(res, 'Lấy thông tin hợp đồng thành công', hopDong);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Lấy thông tin hợp đồng thất bại');
    }
};

exports.createHopDong = async (req, res) => {
    try {
        // Validation ngày tháng
        const { ngayBatDau, ngayKetThuc } = req.body;
        if (new Date(ngayKetThuc) <= new Date(ngayBatDau)) {
            return errorResponse(res, 400, 'Ngày kết thúc phải sau ngày bắt đầu');
        }

        const newId = await HopDong.create(req.body);
        const newHopDong = await HopDong.findById(newId);
        return successResponse(res, 'Tạo hợp đồng thành công', newHopDong);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Lỗi khi lập hợp đồng');
    }
};

exports.updateHopDong = async (req, res) => {
    try {
        const hopDong = await HopDong.findById(req.params.id);
        if (!hopDong) {
            return errorResponse(res, 404, 'Không tìm thấy hợp đồng');
        }

        await HopDong.update(req.params.id, req.body);
        const updatedHopDong = await HopDong.findById(req.params.id);
        return successResponse(res, 'Cập nhật hợp đồng thành công', updatedHopDong);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Lỗi khi cập nhật hợp đồng');
    }
};

exports.deleteHopDong = async (req, res) => {
    try {
        const hopDong = await HopDong.findById(req.params.id);
        if (!hopDong) {
            return errorResponse(res, 404, 'Không tìm thấy hợp đồng');
        }

        await HopDong.delete(req.params.id);
        return successResponse(res, 'Xóa hợp đồng thành công');
    } catch (error) {
        console.error(error);
        return errorResponse(res, 500, 'Lỗi khi xóa hợp đồng');
    }
};
