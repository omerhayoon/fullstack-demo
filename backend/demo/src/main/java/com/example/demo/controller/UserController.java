package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // מאפשר לריאקט (פורט 3000) לדבר עם השרת
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // בקשת POST לרישום משתמש חדש
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody java.util.Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");

        // הגנה 1: בדיקה ששם המשתמש והסיסמה אינם ריקים
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username and password cannot be empty");
        }

        // הגנה 2: בדיקה האם שם המשתמש כבר תפוס
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already taken!");
        }

        // יצירת אובייקט משתמש חדש ושמירתו (כבר מוגדר עם points מההתחלה)
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(password);
        newUser.setPoints(0);

        userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
    }

    // בקשת POST להתחברות משתמש קיים
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody java.util.Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");

        // בדיקה שהשדות אינם ריקים
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username and password cannot be empty");
        }

        // חיפוש המשתמש בבסיס הנתונים
        java.util.Optional<User> userOptional = userRepository.findByUsername(username);

        // אם המשתמש לא נמצא, או שהסיסמה שגויה
        if (userOptional.isEmpty() || !userOptional.get().getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        // אם הכל תקין, נחזיר את אובייקט המשתמש המלא (כולל הניקוד האמיתי שלו)
        return ResponseEntity.ok(userOptional.get());
    }

    // בקשת GET לקבלת כל המשתמשים הרשומים במערכת
    @GetMapping("/all")
    public ResponseEntity<java.util.List<User>> getAllUsers() {
        java.util.List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // 🟢 עדכון נקודות מעודכן מבוסס Map - חוסך יצירת קבצים נוספים ותואם לפרונטאנד ב-100%
    @PostMapping("/update-points")
    public ResponseEntity<?> updatePoints(@RequestBody java.util.Map<String, Object> payload) {
        String username = (String) payload.get("username");
        Integer points = (Integer) payload.get("points");

        if (username == null || points == null) {
            return ResponseEntity.badRequest().body("שגיאה: שם משתמש או ניקוד חסרים בבקשה");
        }

        // 1. נחפש את המשתמש בבסיס הנתונים לפי שם המשתמש שלו
        java.util.Optional<User> userOptional = userRepository.findByUsername(username);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // 2. נעדכן את הניקוד שלו לניקוד החדש שהגיע מהפרונט
            user.setPoints(points);
            
            // 3. נשמור את המשתמש המעודכן חזרה ל-MySQL
            userRepository.save(user);
            
            return ResponseEntity.ok("הניקוד עודכן בהצלחה בבסיס הנתונים!");
        } else {
            return ResponseEntity.badRequest().body("שגיאה: המשתמש לא נמצא במערכת");
        }
    }


    

  
}