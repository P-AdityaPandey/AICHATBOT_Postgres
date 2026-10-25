package com.example.aichatbot.controller;

import com.example.aichatbot.dto.*;
import com.example.aichatbot.service.ChatApplicationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ChatController {
    private final ChatApplicationService service;
    public ChatController(ChatApplicationService service) { this.service = service; }

    @PostMapping("/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) { return service.chat(request); }

    @GetMapping("/sessions")
    public List<SessionResponse> sessions() { return service.listSessions(); }

    @PostMapping("/sessions")
    public SessionResponse createSession(@Valid @RequestBody(required = false) CreateSessionRequest request) {
        return service.createSession(request);
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public List<MessageResponse> messages(@PathVariable String sessionId) { return service.listMessages(sessionId); }

    @DeleteMapping("/sessions/{sessionId}")
    public void deleteSession(@PathVariable String sessionId) { service.deleteSession(sessionId); }
}