package com.railway.railwayreservation.controller;

import com.railway.railwayreservation.entity.Booking;
import com.railway.railwayreservation.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@CrossOrigin
public class BookingController {


    private final BookingService bookingService;


    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }


    // Create booking
    @PostMapping("/create")
    public Booking createBooking(@RequestBody Booking booking) {

        return bookingService.createBooking(booking);

    }


    // View all bookings
    @GetMapping("/all")
    public List<Booking> getAllBookings() {

        return bookingService.getAllBookings();

    }
}