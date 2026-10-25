package com.example.aichatbot.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_messages", indexes = @Index(name = "idx_chat_message_session_time", columnList = "session_id, created_at"))
public class ChatMessage {
    @Id
    private String id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(length = 20)
    private String provider;

    protected ChatMessage() {}
    public ChatMessage(ChatSession session, Role role, String content, String provider) {
        this.id = UUID.randomUUID().toString();
        this.session = session;
        this.role = role;
        this.content = content;
        this.provider = provider;
        this.createdAt = Instant.now();
    }
    public String getId() { return id; }
    public ChatSession getSession() { return session; }
    public Role getRole() { return role; }
    public String getContent() { return content; }
    public Instant getCreatedAt() { return createdAt; }
    public String getProvider() { return provider; }
    public enum Role { USER, ASSISTANT }
}