# CrewAI Multi-Agent Software Project Assistant

A phased implementation guide for the **Agentic AI Lab --- CrewAI
Multi-Agent Software Project Assistant**.

This project is intentionally built in three phases:

-   **Phase 1 --- Knowledge & Skills:** specialized agents, agent-level
    knowledge, crew-level knowledge, and project-analysis tools.
-   **Phase 2 --- Reasoning & Planning:** agent reasoning, crew
    planning, dynamic tool selection, sufficiency evaluation, and
    comparison of planned vs. unplanned execution.
-   **Phase 3 --- Callbacks & Checkpointing:** observability, execution
    logs, checkpoints, failure simulation, restart detection, and
    recovery.

The final system analyzes a software repository and produces a technical
assessment covering code quality, technical debt, architecture,
scalability, and security.

> **Important:** Build Phase 1 completely before modifying the system
> for Phase 2. Build Phase 2 completely before adding Phase 3. This
> keeps the assignment demonstrable and makes debugging much easier.

------------------------------------------------------------------------

## 1. Assignment Requirements

### Assignment 1 --- Knowledge & Skills

Build three specialized agents:

  -----------------------------------------------------------------------
  Agent                               Responsibility
  ----------------------------------- -----------------------------------
  Code Analyst                        Analyze source code, code quality,
                                      maintainability, bugs, smells, and
                                      technical debt

  Architecture Analyst                Analyze architecture, scalability,
                                      dependencies, reliability, and
                                      security

  Technical Lead                      Combine both analyses into a final
                                      technical assessment
  -----------------------------------------------------------------------

Required knowledge:

-   **Agent-level knowledge:** coding standards and code-review rules
    available to the Code Analyst.
-   **Crew-level knowledge:** project requirements and technology-stack
    information available to the crew.

Required tools:

-   `read_project_file()`
-   `search_project()`

### Assignment 2 --- Reasoning & Planning

Extend Assignment 1:

-   Enable reasoning/planning for the Code Analyst.
-   Enable crew-level planning.
-   Let agents decide when project-analysis tools are necessary.
-   Make the Technical Lead evaluate whether available analyses are
    sufficient.
-   Compare execution with reasoning/planning enabled and disabled.

### Assignment 3 --- Callbacks & Checkpointing

Extend the same system:

-   Agent execution callbacks.
-   Task execution callbacks.
-   Tool execution callbacks.
-   Crew execution callbacks.
-   Record name, status, timestamp, and duration.
-   Save a checkpoint after every successful task.
-   Inject a simulated failure after a selected task.
-   Restart and skip completed tasks.
-   Execute only unfinished tasks.
-   Demonstrate failure → restart → recovery.

------------------------------------------------------------------------

# 2. Recommended Development Environment

You can use **Cursor, Windsurf, VS Code, Claude Code, or another local
LLM coding IDE**.

The project itself should remain an ordinary Python project so that it
can be run from the terminal independently of the IDE.

Recommended stack:

-   Python `>=3.10` and `<3.14`
-   CrewAI
-   `uv` for dependency management
-   Git
-   A local project directory containing a small test repository
-   An LLM provider supported by your CrewAI setup

CrewAI's current documentation recommends `uv`, and the current project
documentation states that Python should be `>=3.10` and `<3.14`. Verify
the exact requirements against the installed CrewAI release before
pinning versions.

Official references:

-   https://docs.crewai.com/
-   https://github.com/crewAIInc/crewAI
-   https://github.com/crewAIInc/crewAI-quickstarts

------------------------------------------------------------------------

# 3. Initial Machine Setup

## 3.1 Check Python

Run:

``` bash
python3 --version
```

You want a supported version such as:

``` text
Python 3.11.x
```

or:

``` text
Python 3.12.x
```

If you have several Python versions installed, use the supported one
explicitly.

------------------------------------------------------------------------

## 3.2 Install Git

Check:

``` bash
git --version
```

If Git is missing, install it using your operating system's package
manager or the official Git installer.

------------------------------------------------------------------------

## 3.3 Install uv

CrewAI currently recommends `uv` for project/dependency management.

macOS/Linux:

``` bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Restart the terminal if necessary and verify:

``` bash
uv --version
```

If `uv` is installed but not found, add its installation directory to
your shell PATH as instructed by the installer.

------------------------------------------------------------------------

# 4. Create the Project

Create a workspace:

``` bash
mkdir crewai-software-project-assistant
cd crewai-software-project-assistant
```

Initialize Git:

``` bash
git init
```

Open the folder in your local LLM IDE.

For VS Code:

``` bash
code .
```

For Cursor:

``` bash
cursor .
```

If your IDE uses another command, open the folder through its GUI.

------------------------------------------------------------------------

# 5. Optional: Install Official CrewAI Coding-Agent Skills

If your local LLM IDE supports the `skills.sh` workflow, CrewAI's
repository currently documents:

``` bash
npx skills add crewaiinc/skills
```

This is useful because the coding agent can receive CrewAI-specific
guidance when creating agents, crews, tasks, and flows.

If your IDE does not support this mechanism, skip it. The project should
still work normally using the CrewAI documentation.

------------------------------------------------------------------------

# 6. Create the CrewAI Environment

The preferred route is to use the CrewAI CLI/scaffolding when available.

First check:

``` bash
uv tool install crewai
```

Then:

``` bash
crewai version
```

and:

``` bash
crewai create --help
```

Use the help output from your installed version rather than assuming CLI
flags from an older tutorial.

If you prefer a manually controlled project, create a virtual
environment:

``` bash
uv venv
```

Activate it.

macOS/Linux:

``` bash
source .venv/bin/activate
```

Windows PowerShell:

``` powershell
.venv\Scripts\Activate.ps1
```

Install CrewAI:

``` bash
uv pip install crewai
```

For optional CrewAI tools:

``` bash
uv pip install "crewai[tools]"
```

Verify:

``` bash
python -c "import crewai; print(crewai.__version__)"
```

------------------------------------------------------------------------

# 7. Environment Variables

Create:

``` text
.env
```

Never commit API keys.

Example structure:

``` env
MODEL_NAME=your-model-name
API_KEY=your-api-key
```

The exact environment variables depend on the LLM provider you select.

Add `.env` to `.gitignore`:

``` gitignore
.env
.venv/
__pycache__/
*.pyc
logs/
checkpoints/
outputs/
```

Do not put real secrets into source code.

------------------------------------------------------------------------

# 8. Local LLM Strategy

The assignment says "local LLM IDE", which does not necessarily mean the
model executing CrewAI must be local.

There are two separate concepts:

1.  **Local development environment:** Cursor/Windsurf/VS Code/etc.
2.  **LLM used by CrewAI:** OpenAI, Anthropic, Ollama, another supported
    provider, etc.

For the first working version, use the LLM provider that is easiest for
your environment. Once the architecture works, you can test a local
model if your CrewAI version/provider configuration supports it.

Do not optimize for local inference before the agent workflow itself
works.

------------------------------------------------------------------------

# 9. Final Project Structure

The target structure should evolve toward:

``` text
crewai-software-project-assistant/
│
├── README.md
├── PROJECT_STATE.md
├── pyproject.toml
├── uv.lock
├── .env
├── .gitignore
│
├── src/
│   └── project_assistant/
│       ├── __init__.py
│       ├── agents.py
│       ├── tasks.py
│       ├── crew.py
│       ├── tools.py
│       ├── knowledge.py
│       ├── callbacks.py
│       ├── checkpoints.py
│       ├── config.py
│       └── main.py
│
├── knowledge/
│   ├── coding_standards/
│   │   └── coding_standards.md
│   └── crew/
│       ├── project_requirements.md
│       └── technology_stack.md
│
├── test_project/
│   ├── README.md
│   ├── src/
│   └── ...
│
├── logs/
│
├── checkpoints/
│
├── outputs/
│
└── tests/
    ├── test_tools.py
    ├── test_agents.py
    ├── test_checkpointing.py
    └── test_recovery.py
```

The exact package layout can change if CrewAI's generated project
template uses another structure. Do not fight the generated template
unnecessarily.

------------------------------------------------------------------------

# PHASE 1 --- KNOWLEDGE & SKILLS

# 10. Phase 1 Goal

The first milestone is a working sequential multi-agent software
assessment.

Expected flow:

``` text
                 ┌────────────────────┐
                 │   Project Input     │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │   Code Analyst     │
                 │                    │
                 │ Code quality       │
                 │ Bugs/smells        │
                 │ Technical debt     │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Architecture       │
                 │ Analyst            │
                 │                    │
                 │ Architecture       │
                 │ Scalability        │
                 │ Security           │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │  Technical Lead    │
                 │                    │
                 │ Combine findings   │
                 │ Prioritize risks   │
                 │ Final assessment   │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Final Report       │
                 └────────────────────┘
```

------------------------------------------------------------------------

# 11. Create the Test Project

Do not initially point the system at a huge production repository.

Create a deliberately small `test_project/`.

Include examples of:

-   duplicated code
-   poor naming
-   long functions
-   hard-coded configuration
-   weak error handling
-   insecure patterns
-   unnecessary dependencies
-   tightly coupled modules
-   missing validation
-   inefficient loops

The test project should contain enough problems that the agents have
meaningful findings to report.

A good assignment demonstration is easier when the input project is
controlled.

------------------------------------------------------------------------

# 12. Design the Two Required Tools

## Tool 1 --- `read_project_file()`

Purpose:

``` text
Read the contents of a specific file inside the analyzed project.
```

Inputs should include a safe project-relative path.

Expected behavior:

1.  Resolve the path relative to the project root.
2.  Prevent path traversal such as `../../secret.txt`.
3.  Verify the target is a file.
4.  Read the file.
5.  Return useful text to the agent.
6.  Return a clear error for invalid paths.

Do not allow the agent to read arbitrary files outside the project.

------------------------------------------------------------------------

## Tool 2 --- `search_project()`

Purpose:

``` text
Search project files for a keyword, symbol, pattern, or relevant text.
```

Possible inputs:

``` text
query
file_extension
directory
```

The first implementation can use Python's standard library rather than
adding a large search dependency.

The tool should:

-   search only inside the project root
-   skip `.git`, `.venv`, caches, and generated output
-   return file path + matching line/context
-   handle binary files safely
-   avoid returning enormous outputs

------------------------------------------------------------------------

# 13. Agent-Level Knowledge

Create:

``` text
knowledge/coding_standards/coding_standards.md
```

This should contain the rules that specifically help the Code Analyst.

Suggested sections:

``` text
# Coding Standards

## Naming
- Variables should be descriptive.
- Functions should use clear verbs.
- Avoid ambiguous abbreviations.

## Functions
- Keep functions focused.
- Avoid unnecessary nesting.
- Avoid excessive function length.

## Error Handling
- Handle expected exceptions.
- Do not silently swallow errors.
- Validate external input.

## Maintainability
- Avoid duplicated logic.
- Prefer modular code.
- Avoid unnecessary global state.

## Security
- Never hard-code secrets.
- Validate untrusted input.
- Avoid unsafe dynamic execution.

## Testing
- Important business logic should be testable.
- Critical paths should have automated tests.
```

The Code Analyst should be given this as **agent-level knowledge**, not
merely pasted into every task.

------------------------------------------------------------------------

# 14. Crew-Level Knowledge

Create:

``` text
knowledge/crew/project_requirements.md
```

Include the assignment requirements in a concise form.

Create:

``` text
knowledge/crew/technology_stack.md
```

Include:

-   language(s)
-   framework(s)
-   package manager
-   database
-   frontend/backend
-   deployment assumptions
-   testing framework
-   relevant architectural constraints

Example:

``` text
Project:
Software Project Assistant

Expected assessment:
1. Code quality
2. Technical debt
3. Architecture
4. Scalability
5. Security
6. Risk prioritization
7. Recommendations

Technology:
Python
CrewAI
Local project repository
LLM-based analysis
```

Crew-level knowledge should provide common context to all agents.

------------------------------------------------------------------------

# 15. Agent Responsibilities

## Code Analyst

Role:

``` text
Senior Code Quality Analyst
```

Goal:

``` text
Inspect source code and identify concrete code-quality issues,
technical debt, maintainability problems, bugs, and risky patterns.
```

Backstory should emphasize:

-   code review
-   maintainability
-   clean code
-   debugging
-   technical debt

Tools:

-   `read_project_file`
-   `search_project`

Knowledge:

-   coding standards

Expected output:

-   issue
-   file
-   evidence
-   severity
-   explanation
-   recommendation

------------------------------------------------------------------------

## Architecture Analyst

Role:

``` text
Software Architecture Analyst
```

Goal:

``` text
Evaluate the project's architecture, component boundaries,
dependencies, scalability, reliability, and security posture.
```

Tools:

-   `read_project_file`
-   `search_project`

Knowledge:

-   crew-level requirements
-   technology stack

Expected output:

-   architectural observation
-   affected components
-   risk
-   severity
-   recommendation

------------------------------------------------------------------------

## Technical Lead

Role:

``` text
Technical Lead
```

Goal:

``` text
Combine the code and architecture analyses into a technically
grounded final assessment.
```

The Technical Lead should not simply repeat the other agents.

It should:

1.  Compare findings.
2.  Remove duplicates.
3.  Resolve contradictions.
4.  Prioritize risks.
5.  Identify missing analysis.
6.  State assumptions.
7.  Produce a final assessment.
8.  Recommend the highest-value improvements.

------------------------------------------------------------------------

# 16. Tasks

Create at least three tasks.

### Task 1 --- Code Analysis

Input:

``` text
Project path
```

Output:

``` text
Code analysis report
```

### Task 2 --- Architecture Analysis

Input:

``` text
Project path
```

Output:

``` text
Architecture analysis report
```

### Task 3 --- Final Assessment

Input:

``` text
Code analysis
Architecture analysis
Project requirements
Technology stack
```

Output:

``` text
Final technical assessment
```

Use task dependencies/context so the Technical Lead receives the
previous analyses rather than independently starting over.

------------------------------------------------------------------------

# 17. Phase 1 Output Format

The final report should contain:

``` text
# Technical Assessment

## Executive Summary

## Project Overview

## Code Quality
### Critical Findings
### Major Findings
### Minor Findings

## Technical Debt

## Architecture
### Current Architecture
### Strengths
### Weaknesses

## Scalability

## Security

## Cross-Cutting Risks

## Prioritized Recommendations

## Overall Assessment

## Assumptions and Limitations
```

Make findings evidence-based.

Bad:

``` text
The project has bad architecture.
```

Good:

``` text
The API, business logic, and database operations are concentrated
inside the same module, creating high coupling and making isolated
testing difficult.
```

------------------------------------------------------------------------

# 18. Phase 1 Testing

Run the crew against the controlled `test_project`.

Verify:

-   all three agents execute
-   both tools can be called
-   Code Analyst receives coding standards
-   all agents can access crew-level knowledge
-   Task 3 receives Task 1 and Task 2 outputs
-   final report is generated
-   invalid file paths are rejected
-   search does not leave the project root

Create a Git commit:

``` bash
git add .
git commit -m "Complete Phase 1 multi-agent analysis"
```

Do not move to Phase 2 until this works reliably.

------------------------------------------------------------------------

# PHASE 2 --- REASONING & PLANNING

# 19. Phase 2 Goal

The second phase turns a fixed pipeline into a more adaptive analysis
workflow.

Conceptually:

``` text
                  Project
                     │
                     ▼
             Crew Planning
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   Code Analyst            Architecture
   Reasoning               Analysis
          │                     │
          └──────────┬──────────┘
                     ▼
              Technical Lead
                     │
              Sufficiency?
                /       \
              NO         YES
              │           │
        More analysis     ▼
              │       Final Report
              └─────────┘
```

------------------------------------------------------------------------

# 20. Enable Code Analyst Reasoning

Enable the CrewAI reasoning/planning mechanism supported by the
installed version.

Important:

CrewAI's current API has evolved. In current code, `reasoning` is marked
deprecated in favor of `planning_config`, so inspect the
version-specific documentation/API before choosing the exact
configuration.

The assignment requirement is conceptual:

``` text
Before analyzing, the Code Analyst should determine:
- what files matter
- what information is missing
- which tools are needed
- what analysis order makes sense
```

The agent should not blindly read every file.

------------------------------------------------------------------------

# 21. Agent Tool Selection

The Code Analyst should decide whether it needs:

``` text
search_project()
```

or:

``` text
read_project_file()
```

Example:

``` text
Question:
Where is authentication implemented?

Reasoning:
Search for "auth", "login", "token", "jwt".

Tool:
search_project("jwt")

Result:
src/auth/service.py

Next:
read_project_file("src/auth/service.py")
```

This is better than hard-coding a fixed sequence.

------------------------------------------------------------------------

# 22. Crew-Level Planning

Enable crew planning.

The planner should coordinate:

``` text
1. Understand project requirements.
2. Inspect project structure.
3. Analyze code.
4. Analyze architecture.
5. Cross-check findings.
6. Validate analysis sufficiency.
7. Produce final report.
```

Planning should be observable in your demonstration.

Record:

``` text
Planning enabled: true
Plan:
1. ...
2. ...
3. ...
```

------------------------------------------------------------------------

# 23. Technical Lead Sufficiency Check

Before producing the final report, the Technical Lead must evaluate:

``` text
Do I have enough evidence to produce a reliable assessment?
```

It should check:

-   Was the important source code inspected?
-   Is the architecture sufficiently understood?
-   Are important dependencies identified?
-   Are security-sensitive areas analyzed?
-   Are findings supported by evidence?
-   Are major project requirements covered?

If insufficient, the Technical Lead should explicitly state what is
missing.

Depending on your CrewAI implementation, you can model this as:

``` text
Sufficiency = PASS
```

or:

``` text
Sufficiency = INSUFFICIENT
Missing:
- authentication implementation
- dependency configuration
- deployment configuration
```

Then trigger additional analysis.

------------------------------------------------------------------------

# 24. Compare Reasoning ON vs OFF

Create two execution modes.

## Mode A

``` text
REASONING_ENABLED=false
PLANNING_ENABLED=false
```

## Mode B

``` text
REASONING_ENABLED=true
PLANNING_ENABLED=true
```

Use the same test project and as similar an input as possible.

Record:

  Metric                           Disabled   Enabled
  ------------------------------ ---------- ---------
  Execution time                            
  Tool calls                                
  Files inspected                           
  Analysis completeness                     
  Missing-information findings              
  Final quality                             
  LLM calls                                 

Do not claim that reasoning is "better" merely because it uses more
steps.

Explain the trade-off:

``` text
Reasoning/planning may improve adaptability and completeness,
but can increase latency, token usage, and execution cost.
```

------------------------------------------------------------------------

# 25. Phase 2 Demonstration

Your demo should show:

### Run 1

``` text
Planning disabled
Reasoning disabled
```

### Run 2

``` text
Planning enabled
Code Analyst reasoning enabled
```

Then compare:

``` text
Tool selection
Files inspected
Intermediate reasoning/plan
Final findings
Execution duration
```

Create a Git commit:

``` bash
git add .
git commit -m "Complete Phase 2 reasoning and planning"
```

------------------------------------------------------------------------

# PHASE 3 --- CALLBACKS & CHECKPOINTING

# 26. Phase 3 Goal

The third phase makes the system observable and fault tolerant.

Target behavior:

``` text
START
  │
  ▼
Task 1 ───── SUCCESS ───► checkpoint
  │
  ▼
Task 2 ───── SUCCESS ───► checkpoint
  │
  ▼
Task 3 ───── FAILURE
  │
  ▼
STOP
  │
  │ restart
  ▼
Load checkpoint
  │
  ▼
Skip Task 1
  │
  ▼
Skip Task 2
  │
  ▼
Retry Task 3
  │
  ▼
SUCCESS
```

------------------------------------------------------------------------

# 27. Callback Architecture

Implement callbacks for:

## Agent

Capture:

``` text
agent_name
event
status
timestamp
duration
```

## Task

Capture:

``` text
task_name
status
timestamp
duration
```

## Tool

Capture:

``` text
tool_name
arguments summary
status
timestamp
duration
error
```

Do not log secrets.

## Crew

Capture:

``` text
crew_name
run_id
status
timestamp
duration
```

------------------------------------------------------------------------

# 28. Event Log Format

Use JSON Lines if possible.

Example:

``` json
{"event":"task","task":"code_analysis","status":"success","timestamp":"...","duration":12.4}
```

Each event should be one JSON object per line.

Suggested files:

``` text
logs/
├── execution.jsonl
├── errors.jsonl
└── recovery.jsonl
```

This format makes the logs easy to inspect with Python later.

------------------------------------------------------------------------

# 29. Checkpoint Design

Create:

``` text
checkpoints/
```

A checkpoint should contain enough information to determine:

``` text
Which tasks have successfully completed?
What outputs were produced?
What run was this?
When was the checkpoint written?
```

Example conceptual structure:

``` json
{
  "run_id": "run-001",
  "completed_tasks": [
    "code_analysis",
    "architecture_analysis"
  ],
  "outputs": {
    "code_analysis": "outputs/code_analysis.md",
    "architecture_analysis": "outputs/architecture_analysis.md"
  }
}
```

Do not store unnecessarily large duplicated LLM transcripts inside every
checkpoint.

------------------------------------------------------------------------

# 30. Checkpoint Rules

A task becomes completed only after:

``` text
task execution succeeded
AND
task output was persisted
AND
checkpoint was successfully written
```

Never mark a task complete before its result is safely recorded.

------------------------------------------------------------------------

# 31. Failure Injection

Add a configuration option such as:

``` text
FAIL_AFTER_TASK=architecture_analysis
```

The exact configuration mechanism is your choice.

When the selected task successfully finishes:

``` text
checkpoint saved
failure injected
program exits/fails
```

This deliberately simulates a crash after useful work has been
completed.

------------------------------------------------------------------------

# 32. Restart Logic

When the program starts:

``` text
1. Generate/read run ID.
2. Look for an existing checkpoint.
3. Load completed tasks.
4. Determine remaining tasks.
5. Skip completed tasks.
6. Execute remaining tasks.
7. Save checkpoint after every successful task.
8. Finish final report.
```

Example:

``` text
Checkpoint found.

Completed:
- code_analysis
- architecture_analysis

Remaining:
- final_assessment

Skipping code_analysis.
Skipping architecture_analysis.

Executing final_assessment...
```

------------------------------------------------------------------------

# 33. Complete Failure → Recovery Demonstration

This is the most important Phase 3 demo.

### Run A --- Start

``` text
Task 1: Code Analysis       SUCCESS
Checkpoint                  SAVED

Task 2: Architecture       SUCCESS
Checkpoint                  SAVED

Failure injected.
Process terminated.
```

### Run B --- Restart

``` text
Checkpoint loaded.

Task 1: SKIPPED
Task 2: SKIPPED

Task 3: Final Assessment    RUNNING
Task 3: SUCCESS

Final report generated.
```

The logs should prove this happened.

------------------------------------------------------------------------

# 34. Phase 3 Testing

Test:

### Normal execution

All tasks succeed.

### Failure after Task 1

Restart.

Expected:

``` text
Task 1 skipped
Task 2 runs
Task 3 runs
```

### Failure after Task 2

Restart.

Expected:

``` text
Task 1 skipped
Task 2 skipped
Task 3 runs
```

### Failure during Task 3

Restart.

Expected:

``` text
Task 1 skipped
Task 2 skipped
Task 3 retried
```

### No checkpoint

Expected:

``` text
Full execution
```

### Corrupt checkpoint

Expected:

``` text
Safe error
No silent data loss
```

Create a final Git commit:

``` bash
git add .
git commit -m "Complete Phase 3 callbacks and checkpoint recovery"
```

------------------------------------------------------------------------

# 35. Final Testing Checklist

Before submission, verify all requirements.

## Assignment 1

-   [ ] Code Analyst implemented
-   [ ] Architecture Analyst implemented
-   [ ] Technical Lead implemented
-   [ ] Code-quality analysis works
-   [ ] Architecture analysis works
-   [ ] Final assessment works
-   [ ] Agent-level coding standards knowledge works
-   [ ] Crew-level requirements knowledge works
-   [ ] Crew-level technology knowledge works
-   [ ] `read_project_file()` works
-   [ ] `search_project()` works

## Assignment 2

-   [ ] Code Analyst reasoning enabled
-   [ ] Crew planning enabled
-   [ ] Agents can decide when to use tools
-   [ ] Technical Lead performs sufficiency evaluation
-   [ ] Additional analysis can be requested when needed
-   [ ] Reasoning disabled run completed
-   [ ] Reasoning enabled run completed
-   [ ] Comparison recorded

## Assignment 3

-   [ ] Agent callback
-   [ ] Task callback
-   [ ] Tool callback
-   [ ] Crew callback
-   [ ] Timestamp recorded
-   [ ] Duration recorded
-   [ ] Status recorded
-   [ ] Checkpoint after successful task
-   [ ] Failure injection works
-   [ ] Restart detects checkpoint
-   [ ] Completed tasks are skipped
-   [ ] Remaining tasks execute
-   [ ] Complete recovery demonstrated

------------------------------------------------------------------------

# 36. Suggested Final Repository

``` text
crewai-software-project-assistant/
│
├── README.md
├── PROJECT_STATE.md
├── pyproject.toml
├── uv.lock
├── .env
├── .gitignore
│
├── src/
│   └── project_assistant/
│       ├── __init__.py
│       ├── agents.py
│       ├── tasks.py
│       ├── tools.py
│       ├── knowledge.py
│       ├── callbacks.py
│       ├── checkpoints.py
│       ├── crew.py
│       ├── config.py
│       └── main.py
│
├── knowledge/
│   ├── coding_standards/
│   │   └── coding_standards.md
│   └── crew/
│       ├── project_requirements.md
│       └── technology_stack.md
│
├── test_project/
│   └── ...
│
├── outputs/
├── logs/
├── checkpoints/
│
└── tests/
    ├── test_tools.py
    ├── test_agents.py
    ├── test_reasoning.py
    ├── test_callbacks.py
    └── test_recovery.py
```

------------------------------------------------------------------------

# 37. Recommended Development Order

Do not build everything at once.

Follow this exact order:

``` text
1. Environment
2. CrewAI installation
3. Minimal project
4. Project tools
5. Test project
6. Code Analyst
7. Architecture Analyst
8. Technical Lead
9. Agent-level knowledge
10. Crew-level knowledge
11. Phase 1 execution
12. Phase 1 testing
13. Code Analyst reasoning
14. Crew planning
15. Technical Lead sufficiency check
16. ON/OFF comparison
17. Callbacks
18. Event logging
19. Checkpoints
20. Failure injection
21. Restart detection
22. Recovery
23. End-to-end tests
24. Documentation
25. Final demonstration
```

At each milestone, update `PROJECT_STATE.md`.

------------------------------------------------------------------------

# 38. IDE Instructions for the Local LLM Coding Agent

Give the coding agent small tasks rather than asking it to build the
entire project in one prompt.

Good:

``` text
Implement Assignment 1 Phase 1 only.

First inspect the current project structure.
Do not modify Phase 2 or Phase 3 functionality.
Implement read_project_file and search_project.
Then create the Code Analyst.
Run the tests and report exactly what changed.
```

Then:

``` text
Implement the Architecture Analyst and Technical Lead.
Reuse the existing tools.
Do not redesign working components unnecessarily.
Run the Phase 1 tests.
```

Then:

``` text
Implement agent-level and crew-level knowledge.
Verify that the correct knowledge is attached at the correct scope.
```

This incremental workflow makes the project much easier to debug.

------------------------------------------------------------------------

# 39. Important Engineering Rules

1.  Never hard-code API keys.
2.  Never allow project tools to escape the project root.
3.  Do not let agents read `.env`.
4.  Do not log secrets.
5.  Keep tool outputs bounded.
6.  Use structured outputs where practical.
7.  Keep agent responsibilities separate.
8.  Do not let the Technical Lead blindly repeat findings.
9.  Save checkpoints only after successful task completion.
10. Test failure recovery independently.
11. Keep Phase 1 stable while developing Phase 2.
12. Keep Phase 2 stable while developing Phase 3.
13. Record experiments rather than relying on memory.
14. Pin dependencies once the working version is known.
15. Update this README if the implementation deviates from the planned
    architecture.

------------------------------------------------------------------------

# 40. Final Demonstration Script

Your final lab demonstration should follow this sequence:

### Demonstration 1

Show repository structure.

### Demonstration 2

Show the two tools.

### Demonstration 3

Show agent-level knowledge.

### Demonstration 4

Show crew-level knowledge.

### Demonstration 5

Run Assignment 1.

### Demonstration 6

Show reasoning/planning disabled.

### Demonstration 7

Show reasoning/planning enabled.

### Demonstration 8

Compare both runs.

### Demonstration 9

Show callback logs.

### Demonstration 10

Inject a failure.

### Demonstration 11

Restart.

### Demonstration 12

Show checkpoint-based skipping.

### Demonstration 13

Show successful recovery and final report.

------------------------------------------------------------------------

# 41. Completion Criteria

The project is complete when a fresh user can:

``` bash
git clone <repository>
cd crewai-software-project-assistant
uv sync
```

configure the required LLM environment variables, and run the project.

A successful final run should produce:

``` text
✓ Project discovered
✓ Code Analyst executed
✓ Architecture Analyst executed
✓ Technical Lead executed
✓ Final report generated
✓ Execution events logged
✓ Checkpoints created
✓ Failure simulation demonstrated
✓ Restart/recovery demonstrated
```

The project should be explainable as:

> "A CrewAI multi-agent software project assistant where specialized
> agents analyze code and architecture, shared and agent-specific
> knowledge guides their work, reasoning and planning make analysis
> adaptive, and callbacks plus checkpoints make execution observable and
> recoverable."
