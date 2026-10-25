# AI Chatbot Backend — Google Gemini Only

Java 21 + Spring Boot + Spring AI backend for the AI-Powered Chatbot Application. Google Gemini is the sole AI provider. MySQL stores chat sessions and message history.

## Stack
- Java 21
- Spring Boot 3.5.5
- Spring AI 1.1.0 Google GenAI starter
- MySQL 8
- REST APIs and Actuator health endpoint

## Requirements
- JDK 21
- Maven 3.9+
- MySQL 8.0+ (or Docker Compose)
- Google Gemini API key from https://aistudio.google.com/apikey

## Run locally in IntelliJ
1. Extract this ZIP into a new folder and open the folder in IntelliJ IDEA.
2. Reload Maven projects.
3. Open **Run → Edit Configurations → AiChatbotApplication**.
4. Set environment variables (replace the sample values with your own):
   `GEMINI_API_KEY=your_google_api_key;DB_USERNAME=root;DB_PASSWORD=your_mysql_password`
5. Ensure MySQL is running. The default JDBC URL uses database `ai_chatbot` and can create it if your MySQL user has permission. Override `DB_URL` if needed.
6. Run `AiChatbotApplication.java`.
7. Check `http://localhost:8080/actuator/health`; expected response is `{"status":"UP"}`.

The application configuration is in `src/main/resources/application.yml`. It reads the Gemini API key from `GEMINI_API_KEY` and the database password from `DB_PASSWORD`.

## Run with Docker Compose
Create a local `.env` file in this directory (do not commit it):
```env
GEMINI_API_KEY=your_google_gemini_key
DB_PASSWORD=local_dev_password
```
Then run:
```bash
docker compose up --build
```
This starts MySQL and the backend. The frontend runs separately.

## REST API
Base URL: `http://localhost:8080/api`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/sessions` | Create a conversation. Body: `{"title":"New conversation"}` |
| GET | `/sessions` | List conversations, newest activity first |
| GET | `/sessions/{sessionId}/messages` | Get saved messages |
| DELETE | `/sessions/{sessionId}` | Delete a conversation and its messages |
| POST | `/chat` | Send a message to Google Gemini |

Example chat request:
```json
{
  "sessionId": "UUID-returned-by-sessions",
  "message": "Explain Java records",
  "provider": "GEMINI"
}
```

The response includes `userMessage` and `assistantMessage`. `provider` must be `GEMINI`.

## Prompt engineering and conversation history
The system prompt asks the assistant to be accurate and clear, favor concise responses, provide readable programming examples, acknowledge uncertainty, and treat conversation history as context. The last 12 saved messages are supplied as context.

## Before production
This is a local learning/MVP foundation. Add authentication/authorization, rate limiting, quotas, database migrations (Flyway), structured logging, usage/cost telemetry, managed secret storage, and integration tests before public deployment. `ddl-auto: update` is for local development; use migrations and `ddl-auto: validate` in production.
