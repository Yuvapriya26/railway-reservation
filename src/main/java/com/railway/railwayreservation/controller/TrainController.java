package com.railway.railwayreservation.controller;

import com.railway.railwayreservation.entity.Train;
import com.railway.railwayreservation.service.TrainService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trains")
@CrossOrigin
public class TrainController {

    private final TrainService trainService;


    public TrainController(TrainService trainService) {
        this.trainService = trainService;
    }


    // Add new train
    @PostMapping("/add")
    public Train addTrain(@RequestBody Train train) {
        return trainService.addTrain(train);
    }


    // Search train
    @GetMapping("/search")
    public List<Train> searchTrain(
            @RequestParam String source,
            @RequestParam String destination) {

        return trainService.searchTrain(source, destination);
    }
}