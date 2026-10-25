package com.example.aichatbot.dto;

import jakarta.validation.constraints.Size;

public record CreateSessionRequest(@Size(max = 120) String title) {}