package com.railway.railwayreservation.service;

import com.railway.railwayreservation.entity.User;
import com.railway.railwayreservation.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    // Save User (Register)
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(email);

        if (user != null && user.getPassword().equals(password)) {
            return user;
        }

        return null;
    }



    // Get All Users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


    // Find User by ID
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }


    // Delete User
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}