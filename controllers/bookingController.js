import prisma from '../lib/prisma.js';

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const { 
      serviceId, 
      appointmentDate, 
      appointmentTime, 
      customerName, 
      customerEmail, 
      customerPhone, 
      specialRequests 
    } = req.body;

    // Get service to calculate total amount
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        serviceId: parseInt(serviceId),
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests,
        totalAmount: service.price
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      appointmentDate, 
      appointmentTime, 
      customerName, 
      customerEmail, 
      customerPhone, 
      specialRequests, 
      status, 
      paymentStatus, 
      notes 
    } = req.body;

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        appointmentTime,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests,
        status,
        paymentStatus,
        notes
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.booking.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 