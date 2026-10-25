package com.example.aichatbot.dto;

import com.example.aichatbot.entity.ChatMessage;
import java.time.Instant;

public record MessageResponse(String id, String role, String content, Instant createdAt, String provider) {
    public static MessageResponse from(ChatMessage m) {
        return new MessageResponse(m.getId(), m.getRole().name(), m.getContent(), m.getCreatedAt(), m.getProvider());
    }
}