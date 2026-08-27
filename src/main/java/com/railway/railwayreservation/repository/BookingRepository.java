package com.railway.railwayreservation.repository;

import com.railway.railwayreservation.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

}