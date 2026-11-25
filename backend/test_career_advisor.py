
from app.services.career_advisor import generate_career_recommendations

sample_resume = """
MCA graduate with knowledge of Python, JavaScript, SQL,
HTML, CSS, React.js, FastAPI and PostgreSQL.

Developed an AI-powered document research and RAG agent
using Python, LangChain, LangGraph, embeddings and Chroma.

Completed a web application development internship.
Interested in Python Developer, React Developer
and AI Engineer opportunities.
"""

result = generate_career_recommendations(sample_resume)

print("\n========== AI CAREER RECOMMENDATIONS ==========")

print("\nCareer Summary:")
print(result["career_summary"])

print("\nRecommended Roles:")
for role in result["recommended_roles"]:
    print(f"- {role['role']}: {role['reason']}")

print("\nExisting Skills:")
print(result["existing_skills"])

print("\nSkills to Learn:")
for skill in result["skills_to_learn"]:
    print(f"- {skill['skill']} ({skill['priority']})")
    print(f"  {skill['reason']}")

print("\nLearning Roadmap:")
for phase in result["learning_roadmap"]:
    print(f"\n{phase['duration']}: {phase['topic']}")
    for task in phase["tasks"]:
        print(f"  - {task}")

print("\nRecommended Projects:")
for project in result["project_recommendations"]:
    print(f"- {project['project']}: {project['description']}")

print("\nCareer Tips:")
for tip in result["career_tips"]:
    print(f"- {tip}")

print("\nCareer recommendation test successful!")
