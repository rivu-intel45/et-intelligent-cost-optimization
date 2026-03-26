from crewai import Agent, Task, Crew

# AGENTS
data_agent = Agent(
    role="Data Analyst",
    goal="Load and understand enterprise data",
    backstory="Expert in handling financial and operational datasets"
)

detection_agent = Agent(
    role="Cost Analyst",
    goal="Detect inefficiencies and anomalies",
    backstory="Expert in identifying cost leakages"
)

decision_agent = Agent(
    role="CFO",
    goal="Decide best actions to reduce cost",
    backstory="Expert in financial decision making"
)

# TASKS
# TASK 1 → Data understanding
task1 = Task(
    description="Analyze transactions and resource data",
    expected_output="Clean structured summary of data",
    agent=data_agent
)

# TASK 2 → Detection
task2 = Task(
    description="Detect cost leakages, duplicate payments, and idle resources",
    expected_output="List of cost issues and inefficiencies",
    agent=detection_agent
)

# TASK 3 → Decision
task3 = Task(
    description="Suggest actions to reduce cost based on detected issues",
    expected_output="Recommended actions like shutdown servers or avoid duplicate payments",
    agent=decision_agent
)

# CREW
crew = Crew(
    agents=[data_agent, detection_agent, decision_agent],
    tasks=[task1, task2, task3]
)

def run_agents():
    result = crew.kickoff()
    return result