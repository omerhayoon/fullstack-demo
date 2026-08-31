package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users") // מגדיר את שם הטבלה ב-MySQL
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // מייצר ID אוטומטי (1, 2, 3...)
    private Long id;

    private String username;
    private String password;
    private int points;

    // קונסטרקטור ריק (חובה עבור JPA)
    public User() {
    }

    // קונסטרקטור נוח ליצירת משתמש חדש
    public User(String username, String password, int points) {
        this.username = username;
        this.password = password;
        this.points = points;
    }

    // Getters ו-Setters (כדי שנוכל לקרוא ולעדכן את השדות)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }
}