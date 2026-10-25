package com.example.aichatbot.dto;

import com.example.aichatbot.entity.ChatSession;
import java.time.Instant;

public record SessionResponse(String id, String title, Instant createdAt, Instant updatedAt) {
    public static SessionResponse from(ChatSession s) {
        return new SessionResponse(s.getId(), s.getTitle(), s.getCreatedAt(), s.getUpdatedAt());
    }
}