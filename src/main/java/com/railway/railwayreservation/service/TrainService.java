package com.railway.railwayreservation.service;

import com.railway.railwayreservation.entity.Train;
import com.railway.railwayreservation.repository.TrainRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrainService {

    private final TrainRepository trainRepository;


    public TrainService(TrainRepository trainRepository) {
        this.trainRepository = trainRepository;
    }


    public Train addTrain(Train train) {
        return trainRepository.save(train);
    }


    public List<Train> searchTrain(String source, String destination) {
        return trainRepository.findBySourceAndDestination(source, destination);
    }
}