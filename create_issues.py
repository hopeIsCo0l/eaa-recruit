#!/usr/bin/env python3
"""Parse backlogs.md and create GitHub issues via gh CLI."""

import re
import subprocess
import sys
import time

REPO = "hopeIsCo0l/eaa-recruit"

EPIC_LABELS = {
    range(1, 41):  ("epic-1-spring-boot", "Spring Boot", "0075ca"),
    range(41, 61): ("epic-2-exam-engine", "Go Exam Engine", "e4e669"),
    range(61, 78): ("epic-3-ai-service", "Python AI", "d93f0b"),
    range(78, 100): ("epic-4-frontend", "React Frontend", "0e8a16"),
}

SECTION_LABELS = {
    "Infrastructure & Security Foundation": ("infra", "Infrastructure", "bfd4f2"),
    "User & Identity Management": ("user-identity", "User & Identity", "c5def5"),
    "Job Management": ("job-management", "Job Management", "fef2c0"),
    "Application & Sifting Logic": ("application-sifting", "Application & Sifting", "fbca04"),
    "Exam Orchestration": ("exam-orchestration", "Exam Orchestration", "e99695"),
    "Shortlisting & Interview Scheduling": ("interview-scheduling", "Interview Scheduling", "b60205"),
    "Feedback & Finalization": ("feedback-finalization", "Feedback & Finalization", "ee0701"),
    "Admin & System Health": ("admin-health", "Admin & System Health", "0052cc"),
    "Core Engine & Concurrency Setup": ("concurrency-setup", "Core Engine", "1d76db"),
    "Exam Session Management": ("exam-session", "Exam Session", "0075ca"),
    "Kafka Integration": ("kafka-integration", "Kafka", "e4e669"),
    "NLP & CV Processing": ("nlp-cv", "NLP & CV", "d93f0b"),
    "Semantic Grading": ("semantic-grading", "Semantic Grading", "0e8a16"),
    "Explainability & Reporting": ("xai-reporting", "XAI & Reporting", "bfd4f2"),
    "Compliance & Safety": ("compliance-safety", "Compliance & Safety", "c5def5"),
    "Project Foundation": ("foundation", "Foundation", "fef2c0"),
    "State Management & API Layer": ("state-api", "State & API", "fbca04"),
    "Candidate Portal": ("candidate-portal", "Candidate Portal", "e99695"),
    "Exam Interface": ("exam-interface", "Exam Interface", "b60205"),
    "Recruiter Portal": ("recruiter-portal", "Recruiter Portal", "ee0701"),
    "Admin Portal": ("admin-portal", "Admin Portal", "0052cc"),
}


def get_epic_label(fr_num):
    for r, (name, _, _) in EPIC_LABELS.items():
        if fr_num in r:
            return name
    return None


def create_label(name, color, description=""):
    result = subprocess.run(
        ["gh", "label", "create", name, "--color", color, "--description", description,
         "--repo", REPO, "--force"],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print(f"  Label created: {name}")
    else:
        # Label may already exist
        pass


def setup_labels():
    print("Setting up labels...")
    for r, (name, display, color) in EPIC_LABELS.items():
        create_label(name, color, display)
    for section, (name, display, color) in SECTION_LABELS.items():
        create_label(name, color, display)


def parse_issues(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    issues = []
    current_section = ""

    # Split by FR headings
    parts = re.split(r'\n(?=## FR-\d+:)', content)

    for part in parts:
        # Check for section headers within the part (before FR heading)
        section_match = re.search(r'### (.+)', part)
        if section_match:
            current_section = section_match.group(1).strip()

        fr_match = re.match(r'## (FR-(\d+)): (.+)', part.strip())
        if not fr_match:
            # Might contain section headers for next issue
            lines = part.split('\n')
            for line in lines:
                s = re.match(r'### (.+)', line)
                if s:
                    current_section = s.group(1).strip()
            continue

        fr_id = fr_match.group(1)
        fr_num = int(fr_match.group(2))
        title = fr_match.group(3).strip()

        # Extract description
        desc_match = re.search(r'\*\*Description:\*\*\s*(.+?)(?=\*\*Actors:|$)', part, re.DOTALL)
        description = desc_match.group(1).strip() if desc_match else ""

        # Extract actors
        actors_match = re.search(r'\*\*Actors:\*\*\s*(.+?)(?=\*\*Preconditions:|$)', part, re.DOTALL)
        actors = actors_match.group(1).strip() if actors_match else ""

        # Extract preconditions
        pre_match = re.search(r'\*\*Preconditions:\*\*\s*(.+?)(?=\*\*Acceptance Criteria:|$)', part, re.DOTALL)
        preconditions = pre_match.group(1).strip() if pre_match else ""

        # Extract acceptance criteria
        ac_match = re.search(r'\*\*Acceptance Criteria:\*\*\s*(.+?)(?=---|\Z)', part, re.DOTALL)
        acceptance_criteria = ac_match.group(1).strip() if ac_match else ""

        issues.append({
            "fr_id": fr_id,
            "fr_num": fr_num,
            "title": title,
            "description": description,
            "actors": actors,
            "preconditions": preconditions,
            "acceptance_criteria": acceptance_criteria,
            "section": current_section,
        })

    return issues


def build_body(issue):
    parts = [f"**{issue['fr_id']}**\n"]
    if issue["description"]:
        parts.append(f"## Description\n{issue['description']}\n")
    if issue["actors"]:
        parts.append(f"## Actors\n{issue['actors']}\n")
    if issue["preconditions"]:
        parts.append(f"## Preconditions\n{issue['preconditions']}\n")
    if issue["acceptance_criteria"]:
        parts.append(f"## Acceptance Criteria\n{issue['acceptance_criteria']}\n")
    return "\n".join(parts)


def create_issue(issue):
    title = f"[{issue['fr_id']}] {issue['title']}"
    body = build_body(issue)

    labels = []
    epic_label = get_epic_label(issue["fr_num"])
    if epic_label:
        labels.append(epic_label)

    # Find section label
    for section_key, (name, _, _) in SECTION_LABELS.items():
        if section_key.lower() in issue["section"].lower():
            labels.append(name)
            break

    cmd = ["gh", "issue", "create",
           "--repo", REPO,
           "--title", title,
           "--body", body]

    for label in labels:
        cmd += ["--label", label]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        url = result.stdout.strip()
        print(f"  Created {issue['fr_id']}: {url}")
        return True
    else:
        print(f"  FAILED {issue['fr_id']}: {result.stderr.strip()}", file=sys.stderr)
        return False


def main():
    issues = parse_issues("backlogs.md")
    print(f"Parsed {len(issues)} issues.")

    setup_labels()
    print(f"\nCreating {len(issues)} issues...\n")

    success = 0
    failed = 0
    for i, issue in enumerate(issues, 1):
        print(f"[{i}/{len(issues)}] {issue['fr_id']}: {issue['title'][:60]}")
        ok = create_issue(issue)
        if ok:
            success += 1
        else:
            failed += 1
        # Small delay to avoid rate limiting
        if i % 10 == 0:
            time.sleep(2)

    print(f"\nDone. {success} created, {failed} failed.")


if __name__ == "__main__":
    main()
