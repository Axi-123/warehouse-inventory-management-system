const TransferService = require('../services/transfer.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createTransferRequest = asyncHandler(async (req, res) => {
  const transfer = await TransferService.createTransferRequest({
    ...req.body,
    userId: req.user._id,
    user: req.user,
  });
  res.status(201).json(new ApiResponse(201, transfer, 'Transfer request created successfully'));
});

const getAllTransferRequests = asyncHandler(async (req, res) => {
  const transfers = await TransferService.getAllTransferRequests(req.query, req.user);
  res
    .status(200)
    .json(new ApiResponse(200, transfers, 'Transfer requests fetched successfully'));
});

const getTransferRequestById = asyncHandler(async (req, res) => {
  const transfer = await TransferService.getTransferRequestById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, transfer, 'Transfer request details fetched successfully'));
});

const approveTransferRequest = asyncHandler(async (req, res) => {
  const transfer = await TransferService.approveTransferRequest(
    req.params.id,
    req.user._id,
    req.user
  );
  res.status(200).json(new ApiResponse(200, transfer, 'Transfer request approved and processed successfully'));
});

const rejectTransferRequest = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const transfer = await TransferService.rejectTransferRequest(
    req.params.id,
    rejectionReason,
    req.user._id,
    req.user
  );
  res.status(200).json(new ApiResponse(200, transfer, 'Transfer request rejected successfully'));
});

module.exports = {
  createTransferRequest,
  getAllTransferRequests,
  getTransferRequestById,
  approveTransferRequest,
  rejectTransferRequest,
};
