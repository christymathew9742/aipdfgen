📄 PDF Upload & 🤖 Chatbot Interaction API
This project provides two main API endpoints:

Upload PDF File

Interact with Chatbot AI using Uploaded PDF

🔗 API Endpoints
📁 1. Upload PDF File
Endpoint: http://localhost:5001/api/uploads

Method: POST

Content-Type: multipart/form-data

Form Key: file (type: file)

📥 Request Example (Using curl)

curl -X POST http://localhost:5001/api/uploads \
  -F "file=@/path/to/your-file.pdf"

✅ Successful Response

{
  "message": "File uploaded successfully",
  "fileUrl": "http://localhost:5001/uploads/PDF-2025-04-23/0f4bc657-5136-4fbd-8e8d-dbc1ab4b8808-Abinash_Parida_Resume-(1).pdf",
  "uploadedFileId": "0f4bc657-5136-4fbd-8e8d-dbc1ab4b8808"
}
🤖 2. Chatbot AI Interaction
Endpoint: http://localhost:5001/api/chatbot

Method: POST

Content-Type: application/json

📤 Request Body Format

{
  "prompt": "hi",
  "uploadedFileId": "0f4bc657-5136-4fbd-8e8d-dbc1ab4b8808"
}
✅ Successful Response

{
  "success": true,
  "data": "hi how can I help you?"
}
🚀 Usage Flow
Upload a PDF file via /api/uploads.

IMP:
***Use the returned "uploadedFileId" to query the chatbot via /api/chatbot.***