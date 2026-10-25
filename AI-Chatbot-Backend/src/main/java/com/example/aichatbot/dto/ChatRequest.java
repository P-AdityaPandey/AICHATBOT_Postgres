package com.example.aichatbot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank String sessionId,
        @NotBlank @Size(max = 12000) String message,
        @NotNull Provider provider
) {
    public enum Provider { GEMINI }
}