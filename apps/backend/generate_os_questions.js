require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateQuestions() {
  const allQuestions = [];
  const chunks = 5; // 5 chunks of 20 questions
  const topics = ['Process Management', 'Memory Management', 'File Systems', 'Concurrency and Deadlocks', 'I/O Systems'];

  for (let i = 0; i < chunks; i++) {
    console.log(`Generating chunk ${i + 1}/${chunks} for topic: ${topics[i]}...`);
    const prompt = `Generate 20 multiple choice questions about Operating Systems, specifically focusing on "${topics[i]}".
    Return the response as a raw JSON array of objects. Do not include markdown formatting or the \`\`\`json block wrapper.
    Each object must have exactly these fields:
    - "subjectId": "YOUR_OS_SUBJECT_ID_HERE"
    - "subtopic": "${topics[i]}"
    - "difficulty": "Medium" (mix of Easy, Medium, Hard)
    - "questionText": string
    - "options": array of exactly 4 strings
    - "correctOptionIndex": integer (0-3)
    - "explanation": string explaining why the answer is correct
    - "marks": integer (1 for Easy, 2 for Medium, 3 for Hard)`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const aiText = response.text || '[]';
      const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const questions = JSON.parse(cleanedText);
      allQuestions.push(...questions);
    } catch (err) {
      console.error(`Error generating chunk ${i + 1}:`, err.message);
    }
  }

  const outputPath = path.join(__dirname, 'os_questions.json');
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2));
  console.log(`Successfully generated ${allQuestions.length} questions and saved to ${outputPath}`);
}

generateQuestions();
