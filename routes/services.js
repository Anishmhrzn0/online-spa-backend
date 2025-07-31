import express from 'express';
import { getAllServices, getServiceById, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/services
// @access  Public
router.get('/', getAllServices);

// @route   GET /api/services/:id
// @access  Public
router.get('/:id', getServiceById);

// @route   POST /api/services
// @access  Private/Admin
router.post('/', protect, admin, createService);

// @route   PUT /api/services/:id
// @access  Private/Admin
router.put('/:id', protect, admin, updateService);

// @route   DELETE /api/services/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteService);

export default router; 