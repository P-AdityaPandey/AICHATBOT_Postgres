package com.example.aichatbot.repository;

import com.example.aichatbot.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findBySession_IdOrderByCreatedAtAsc(String sessionId);
    void deleteBySession_Id(String sessionId);
}