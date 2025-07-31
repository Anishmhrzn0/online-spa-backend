import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, getAllUsers);

// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, getUserById);

// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, updateUser);

// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteUser);

export default router; 