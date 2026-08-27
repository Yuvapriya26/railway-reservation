package com.railway.railwayreservation.service;

import com.railway.railwayreservation.entity.Booking;
import com.railway.railwayreservation.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;


    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }


    // Save booking
    public Booking createBooking(Booking booking) {
        return bookingRepository.save(booking);
    }


    // Get all bookings
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}