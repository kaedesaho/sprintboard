"""Create or reset the demo account and its sample data.

Usage (from backend/):  python seed_demo.py

Safe to re-run: it only deletes projects whose members are all demo accounts,
then rebuilds them. Sprint dates are relative to today so the demo always
looks current.
"""
import secrets
from datetime import date, datetime, time, timedelta

from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash

from db import get_db
from routes.users import DEMO_USERNAME

TODAY = date.today()


def day(offset):
    return TODAY + timedelta(days=offset)


def at(offset, hour, minute=0):
    return datetime.combine(day(offset), time(hour, minute))


# username -> (email, first_name, last_name)
DEMO_USERS = {
    DEMO_USERNAME: ("demo@sprintboard.dev", "Demo", "User"),
    "demo.maya": ("maya@sprintboard.dev", "Maya", "Chen"),
    "demo.leo": ("leo@sprintboard.dev", "Leo", "Garcia"),
    "demo.priya": ("priya@sprintboard.dev", "Priya", "Patel"),
}

# Each project: members as (username, role); tasks as
# (title, description, status, priority, sprint, start, end, hours, assignees, categories, depends_on_titles)
# with start/end as day offsets from today; notes as dicts.
PROJECTS = [
    {
        "title": "Habit Tracker App",
        "description": "Mobile app that helps people build daily habits with streaks, reminders, and progress charts.",
        "cur_sprint": 3,
        "members": [(DEMO_USERNAME, "Admin"), ("demo.maya", "Member"), ("demo.leo", "Member"), ("demo.priya", "Member")],
        "categories": ["Planning", "Design", "Frontend", "Backend", "DevOps", "QA"],
        "tasks": [
            # Sprint 1
            ("Define MVP scope", "Agree on the must-have features for the first release.", "done", "high", 1, -34, -32, 4, [DEMO_USERNAME], ["Planning"], []),
            ("Design database schema", "Users, habits, check-ins, and streak tables.", "done", "high", 1, -32, -29, 6, ["demo.leo"], ["Backend"], ["Define MVP scope"]),
            ("Wireframe core screens", "Onboarding, habit list, check-in, and progress screens.", "done", "medium", 1, -33, -27, 8, ["demo.maya"], ["Design"], ["Define MVP scope"]),
            ("Set up CI pipeline", "Lint, type-check, and run tests on every pull request.", "done", "medium", 1, -28, -25, 3, ["demo.priya"], ["DevOps"], []),
            # Sprint 2
            ("User authentication API", "Sign up, log in, and password reset endpoints.", "done", "high", 2, -20, -16, 10, ["demo.leo"], ["Backend"], ["Design database schema"]),
            ("Login & signup screens", None, "done", "medium", 2, -18, -14, 6, ["demo.maya"], ["Frontend"], ["Wireframe core screens"]),
            ("Habit CRUD endpoints", "Create, edit, archive, and list habits.", "done", "high", 2, -15, -10, 8, ["demo.leo"], ["Backend"], ["User authentication API"]),
            ("Streak calculation logic", "Handle time zones and missed days without breaking streaks unfairly.", "review", "high", 2, -12, -8, 6, ["demo.priya"], ["Backend"], ["Habit CRUD endpoints"]),
            # Sprint 3 (current)
            ("Push notification service", "Daily reminders at the user's chosen time.", "in_progress", "high", 3, -6, -2, 8, [DEMO_USERNAME, "demo.priya"], ["Backend", "DevOps"], ["Habit CRUD endpoints"]),
            ("Habit list screen", "Show today's habits with quick check-in buttons.", "in_progress", "medium", 3, -5, 2, 6, ["demo.maya", DEMO_USERNAME], ["Frontend"], ["Habit CRUD endpoints"]),
            ("Write API tests", "Cover auth and habit endpoints.", "testing", "medium", 3, -4, 1, 5, ["demo.leo"], ["Backend", "QA"], ["User authentication API"]),
            ("Integrate analytics SDK", "Blocked: waiting on API keys from the analytics vendor.", "blocked", "medium", 3, -3, 3, 3, ["demo.priya"], ["DevOps"], []),
            ("Daily check-in flow", "One-tap check-in with an undo option.", "todo", "high", 3, -1, 4, 5, [DEMO_USERNAME], ["Frontend"], ["Habit list screen"]),
            ("Progress charts", "Weekly and monthly completion charts.", "todo", "medium", 3, 1, 6, 6, ["demo.maya"], ["Frontend", "Design"], ["Streak calculation logic"]),
            ("Accessibility audit", "Screen reader labels, contrast, and tap target sizes.", "todo", "low", 3, 3, 7, 4, [DEMO_USERNAME], ["QA"], []),
            # Sprint 4 / backlog
            ("Offline sync", "Queue check-ins while offline and sync when back online.", "backlog", "medium", 4, 8, 14, 10, [], ["Backend", "Frontend"], ["Daily check-in flow"]),
            ("Dark mode", None, "backlog", "low", None, None, None, None, [], ["Design", "Frontend"], []),
            ("Share streaks with friends", None, "backlog", "low", None, None, None, None, [], ["Frontend"], []),
        ],
        "notes": [
            {
                "title": "Sprint 1 Kickoff", "note_type": "meeting", "sprint_num": 1, "creator": DEMO_USERNAME,
                "leader": DEMO_USERNAME, "note_taker": "demo.maya", "planned_time": at(-34, 10), "place": "Zoom", "is_shared": True,
                "content": "## Agenda\n- Introductions and roles\n- MVP scope\n- Sprint 1 goals\n\n## Decisions\n- Mobile-first, iOS and Android via React Native\n- Two-week sprints\n\n## Action Items\n- [x] Maya: wireframes for core screens\n- [x] Leo: first draft of the schema",
            },
            {
                "title": "Sprint 2 Retrospective", "note_type": "retrospective", "sprint_num": 2, "creator": "demo.priya",
                "leader": DEMO_USERNAME, "note_taker": "demo.priya", "planned_time": at(-7, 15), "place": "Conference Room B", "is_shared": True,
                "content": "## What Went Well\n- Auth API shipped early\n- Pairing on the habit endpoints worked well\n\n## What Could Be Improved\n- Streak logic was underestimated\n- Reviews sat for too long\n\n## Action Items\n- [ ] Review pull requests within one working day\n- [ ] Split tasks over 8 hours",
            },
            {
                "title": "Sprint 3 Planning", "note_type": "meeting", "sprint_num": 3, "creator": DEMO_USERNAME,
                "leader": DEMO_USERNAME, "note_taker": "demo.leo", "planned_time": at(-6, 10), "place": "Zoom", "is_shared": True,
                "content": "## Sprint Goal\nUsers can see today's habits and check in.\n\n## Committed\n- Habit list screen\n- Daily check-in flow\n- Push notifications\n\n## Risks\n- Analytics vendor keys may not arrive in time",
            },
            {
                "title": "API Conventions", "note_type": "documentation", "sprint_num": None, "creator": "demo.leo",
                "leader": None, "note_taker": None, "planned_time": None, "place": None, "is_shared": True,
                "content": "## REST Conventions\n- Plural nouns: `/habits`, `/check-ins`\n- `PATCH` for partial updates\n- Errors return `{ \"error\": \"message\" }` with a proper status code\n\n## Dates\nAll timestamps are UTC ISO 8601.",
            },
            {
                "title": "Streak edge cases", "note_type": "task-related", "sprint_num": 3, "creator": "demo.priya",
                "leader": None, "note_taker": None, "planned_time": None, "place": None, "is_shared": True,
                "content": "- User changes time zone mid-streak\n- Check-in at 11:59 pm vs 12:01 am\n- Habit paused for vacation should not reset the streak",
            },
            {
                "title": "My notes for this sprint", "note_type": "personal", "sprint_num": 3, "creator": DEMO_USERNAME,
                "leader": None, "note_taker": None, "planned_time": None, "place": None, "is_shared": False,
                "content": "- Follow up with the vendor about analytics keys\n- Ask Maya about empty states for the habit list\n- Prepare the sprint demo",
            },
        ],
    },
    {
        "title": "Company Website Refresh",
        "description": "New marketing site with updated branding and a faster landing page.",
        "cur_sprint": 1,
        "members": [("demo.maya", "Admin"), (DEMO_USERNAME, "Member"), ("demo.priya", "Member")],
        "categories": ["Design", "Content", "Frontend"],
        "tasks": [
            ("New brand guidelines", None, "done", "high", 1, -8, -5, 6, ["demo.maya"], ["Design"], []),
            ("Landing page copy", "Headline, feature sections, and FAQ.", "in_progress", "medium", 1, -4, 3, 4, [DEMO_USERNAME], ["Content"], []),
            ("Build landing page", None, "todo", "high", 1, 1, 6, 8, ["demo.priya"], ["Frontend"], ["New brand guidelines", "Landing page copy"]),
            ("Pricing page", None, "backlog", "low", None, None, None, None, [], ["Design", "Frontend"], []),
        ],
        "notes": [
            {
                "title": "Website kickoff", "note_type": "meeting", "sprint_num": 1, "creator": "demo.maya",
                "leader": "demo.maya", "note_taker": DEMO_USERNAME, "planned_time": at(-9, 11), "place": "Zoom", "is_shared": True,
                "content": "## Goals\n- Refresh branding\n- Landing page under 1s load time\n\n## Owners\n- Design: Maya\n- Copy: Demo\n- Build: Priya",
            },
        ],
    },
]


def upsert_users(cur):
    ids = {}
    for username, (email, first, last) in DEMO_USERS.items():
        # Random password: demo accounts can't be used through the normal login form
        unusable = generate_password_hash(secrets.token_urlsafe(32))
        cur.execute(
            """
            INSERT INTO users (username, email, password, first_name, last_name)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (username) DO UPDATE
                SET email = EXCLUDED.email, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name
            RETURNING id
            """,
            (username, email, unusable, first, last),
        )
        ids[username] = cur.fetchone()["id"]
    return ids


def delete_demo_projects(cur, demo_ids):
    # Only projects where every member is a demo account
    cur.execute(
        """
        SELECT project_id FROM project_members
        GROUP BY project_id
        HAVING bool_and(user_id = ANY(%s))
        """,
        (list(demo_ids),),
    )
    project_ids = [r["project_id"] for r in cur.fetchall()]
    if not project_ids:
        return 0
    # Tasks, notes, categories, and members are removed by ON DELETE CASCADE
    cur.execute("DELETE FROM projects WHERE id = ANY(%s)", (project_ids,))
    return len(project_ids)


def create_project(cur, spec, user_ids):
    cur.execute(
        "INSERT INTO projects (title, description, cur_sprint) VALUES (%s, %s, %s) RETURNING id",
        (spec["title"], spec["description"], spec["cur_sprint"]),
    )
    project_id = cur.fetchone()["id"]

    for username, role in spec["members"]:
        cur.execute(
            "INSERT INTO project_members (project_id, user_id, role) VALUES (%s, %s, %s)",
            (project_id, user_ids[username], role),
        )

    category_ids = {}
    for name in spec["categories"]:
        cur.execute(
            "INSERT INTO categories (name, project_id) VALUES (%s, %s) RETURNING id",
            (name, project_id),
        )
        category_ids[name] = cur.fetchone()["id"]

    task_ids = {}
    for (title, description, status, priority, sprint, start, end, hours,
         assignees, categories, _deps) in spec["tasks"]:
        cur.execute(
            """
            INSERT INTO tasks (title, description, status, priority, sprint,
                               start_date, end_date, time_estimation, project_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """,
            (title, description, status, priority, sprint,
             day(start) if start is not None else None,
             day(end) if end is not None else None,
             hours, project_id),
        )
        task_id = cur.fetchone()["id"]
        task_ids[title] = task_id
        for username in assignees:
            cur.execute(
                "INSERT INTO task_assignees (task_id, user_id) VALUES (%s, %s)",
                (task_id, user_ids[username]),
            )
        for name in categories:
            cur.execute(
                "INSERT INTO task_categories (task_id, category_id) VALUES (%s, %s)",
                (task_id, category_ids[name]),
            )

    for task in spec["tasks"]:
        for dep_title in task[10]:
            cur.execute(
                "INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES (%s, %s)",
                (task_ids[task[0]], task_ids[dep_title]),
            )

    for note in spec["notes"]:
        cur.execute(
            """
            INSERT INTO notes (project_id, title, note_type, sprint_num, creator_id, leader_id,
                               note_taker_id, planned_time, place, content, is_shared)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (project_id, note["title"], note["note_type"], note["sprint_num"],
             user_ids[note["creator"]],
             user_ids.get(note["leader"]), user_ids.get(note["note_taker"]),
             note["planned_time"], note["place"], note["content"], note["is_shared"]),
        )

    return project_id


def main():
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            user_ids = upsert_users(cur)
            removed = delete_demo_projects(cur, user_ids.values())
            created = [create_project(cur, spec, user_ids) for spec in PROJECTS]
        conn.commit()
        print(f"Demo ready: user '{DEMO_USERNAME}' (id {user_ids[DEMO_USERNAME]}), "
              f"removed {removed} old demo project(s), created projects {created}")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
