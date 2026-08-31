package com.example.demo.controller; // 🟢 תתאים את ה-package המדויק שלך (למשל com.example.demo.controller)

public class UpdatePointsRequest {
    private String username;
    private int points;

    // Getters ו-Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
}