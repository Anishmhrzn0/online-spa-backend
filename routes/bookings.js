import express from 'express';
import { getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking, getUserBookings } from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/bookings
// @access  Private/Admin
router.get('/', protect, admin, getAllBookings);

// @route   GET /api/bookings/my
// @access  Private
router.get('/my', protect, getUserBookings);

// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, getBookingById);

// @route   POST /api/bookings
// @access  Private
router.post('/', protect, createBooking);

// @route   PUT /api/bookings/:id
// @access  Private
router.put('/:id', protect, updateBooking);

// @route   DELETE /api/bookings/:id
// @access  Private
router.delete('/:id', protect, deleteBooking);

export default router; 