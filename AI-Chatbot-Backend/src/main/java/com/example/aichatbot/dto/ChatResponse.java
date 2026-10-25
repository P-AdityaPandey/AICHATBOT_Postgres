package com.example.aichatbot.dto;

public record ChatResponse(MessageResponse userMessage, MessageResponse assistantMessage) {}