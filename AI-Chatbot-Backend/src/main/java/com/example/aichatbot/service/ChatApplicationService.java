package com.example.aichatbot.service;

import com.example.aichatbot.dto.*;
import com.example.aichatbot.entity.ChatMessage;
import com.example.aichatbot.entity.ChatSession;
import com.example.aichatbot.repository.ChatMessageRepository;
import com.example.aichatbot.repository.ChatSessionRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatApplicationService {
    private final ChatSessionRepository sessions;
    private final ChatMessageRepository messages;
    private final AiChatService aiChatService;

    public ChatApplicationService(ChatSessionRepository sessions, ChatMessageRepository messages, AiChatService aiChatService) {
        this.sessions = sessions;
        this.messages = messages;
        this.aiChatService = aiChatService;
    }

    @Transactional
    public ChatResponse chat(ChatRequest request) {
        ChatSession session = sessions.findById(request.sessionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        List<ChatMessage> previous = messages.findBySession_IdOrderByCreatedAtAsc(session.getId());
        String context = previous.stream().skip(Math.max(0, previous.size() - 12))
                .map(m -> m.getRole().name() + ": " + m.getContent())
                .collect(Collectors.joining("\\n"));
        String answer;
        try {
            answer = aiChatService.answer(request.message(), context);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "AI provider request failed. Verify the selected provider API key and model configuration.");
        }
        ChatMessage userMessage = messages.save(new ChatMessage(session, ChatMessage.Role.USER, request.message().trim(), request.provider().name()));
        ChatMessage assistantMessage = messages.save(new ChatMessage(session, ChatMessage.Role.ASSISTANT,
                answer == null || answer.isBlank() ? "I couldn't generate a response. Please try again." : answer,
                request.provider().name()));
        session.renameFromFirstMessage(request.message());
        sessions.save(session);
        return new ChatResponse(MessageResponse.from(userMessage), MessageResponse.from(assistantMessage));
    }

    public List<SessionResponse> listSessions() {
        return sessions.findAllByOrderByUpdatedAtDesc().stream().map(SessionResponse::from).toList();
    }

    @Transactional
    public SessionResponse createSession(CreateSessionRequest request) {
        return SessionResponse.from(sessions.save(new ChatSession(request == null ? null : request.title())));
    }

    public List<MessageResponse> listMessages(String sessionId) {
        if (!sessions.existsById(sessionId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found");
        return messages.findBySession_IdOrderByCreatedAtAsc(sessionId).stream().map(MessageResponse::from).toList();
    }

    @Transactional
    public void deleteSession(String sessionId) {
        ChatSession session = sessions.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        messages.deleteBySession_Id(sessionId);
        sessions.delete(session);
    }
}