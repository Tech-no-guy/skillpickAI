# SkillPick AI — Autonomous Hiring & Assessment Agent

SkillPick AI is a multi-agent hiring and assessment system built for the **Kaggle AI Agents Capstone (Nov 2025)**. It automates the complete lifecycle of a technical hiring process:

- **Recruiter** creates a hiring process and shares a public test link.
- **Candidates** upload resumes and take an AI-generated assessment.
- **Gemini-based agents** screen resumes, generate questions, evaluate answers, and summarize performance.
- **Recruiter** views analytics and dashboards to make data-driven hiring decisions.

---

## 1. Multi-Agent Architecture

SkillPick AI uses **6 Gemini 2.x Flash–powered agents**, each implemented as tools in `backend/gemini_client.py`:

1. **JD Agent**
   - Function: `jd_agent_extract`
   - Task: Extracts skills, role level, tech stack, and experience expectations from the job description.
   - Output JSON:
     ```json
     {
       "skills": [],
       "role_level": "",
       "tech_stack": [],
       "experience_expectations": ""
     }
     ```

2. **Resume Agent**
   - Function: `resume_agent_match`
   - Task: Matches resume text to JD & JD analysis, producing a match score and decision.
   - Output JSON:
     ```json
     {
       "match_score": 0,
       "skill_overlap": [],
       "experience_relevance": "",
       "summary": "",
       "decision": "allow"
     }
     ```

3. **Question Generator Agent**
   - Function: `question_generator_agent`
   - Task: Generates **MCQ**, **coding**, and **theory** questions aligned with the JD.
   - Output JSON:
     ```json
     {
       "mcq": [ { "id": "...", "question": "...", "options": [...], "correct_index": 0, "skill": "..." } ],
       "coding": [ { "id": "...", "title": "...", "description": "...", "difficulty": "...", "expected_time_minutes": 20, "skill": "..." } ],
       "theory": [ { "id": "...", "question": "...", "skill": "..." } ]
     }
     ```

4. **Code Evaluation Agent**
   - Function: `code_evaluation_agent`
   - Task: Evaluates code answers for correctness, style, and efficiency.
   - Output JSON:
     ```json
     {
       "per_question": [
         { "question_id": "code1", "score": 0, "feedback": "..." }
       ],
       "total_score": 0,
       "summary": "..."
     }
     ```

5. **Theory Evaluation Agent**
   - Function: `theory_evaluation_agent`
   - Task: Scores open-ended theoretical answers.
   - Output JSON:
     ```json
     {
       "per_question": [
         { "question_id": "theory1", "score": 0, "feedback": "..." }
       ],
       "total_score": 0,
       "summary": "..."
     }
     ```

6. **Final Summary Agent**
   - Function: `summary_agent`
   - Task: Fuses JD analysis, resume match, and all scores into an overall recommendation.
   - Output JSON:
     ```json
     {
       "overall_score": 0,
       "strengths": [],
       "weaknesses": [],
       "verdict": "strong_hire",
       "explanation": ""
     }
     ```

All agents call Gemini with the **required format**:

```python
response = model.generate_content([
    {"role": "user", "parts": [{"text": PROMPT_TEXT}]}
])
