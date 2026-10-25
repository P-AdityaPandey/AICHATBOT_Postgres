package com.example.aichatbot.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_sessions")
public class ChatSession {
    @Id
    private String id;
    @Column(nullable = false, length = 120)
    private String title;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;

    protected ChatSession() {}

    public ChatSession(String title) {
        this.id = UUID.randomUUID().toString();
        this.title = title == null || title.isBlank() ? "New conversation" : title.trim();
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void renameFromFirstMessage(String message) {
        if ("New conversation".equals(title) && message != null && !message.isBlank()) {
            title = message.trim().length() > 42 ? message.trim().substring(0, 42) + "…" : message.trim();
        }
        updatedAt = Instant.now();
    }
    public void touch() { updatedAt = Instant.now(); }
    public String getId() { return id; }
    public String getTitle() { return title; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}