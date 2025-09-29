<header>content/github-models/responsible-use-of-github-models.md### FILE: guardian_ai_system.py
# guardian_ai_system.py import json import threading import time from typing import List, Dict, Any # ------------------------------- # Law Compliance Module # ------------------------------- class LawComplianceModule: def __init__(self, law_db: Dict[str, Any]): self.law_db = law_db def is_compliant(self, action: dict, country_code: str) -> bool: law_rules = self.law_db.get(country_code, {}) action_type = action.get("type") return law_rules.get(action_type, True) # ------------------------------- # Plan Manager # ------------------------------- class PlanManager: def __init__(self): self.backup_plans = {} def add_backup_plan(self, main_plan: str, backup_plan: str): self.backup_plans[main_plan] = backup_plan def get_backup_plan(self, main_plan: str): return self.backup_plans.get(main_plan, None) # ------------------------------- # Team Member # ------------------------------- class TeamMember: def __init__(self, name: str): self.name = name def suggest_solution(self, event: dict) -> dict: return { "solution": f"{self.name}'s solution for {event.get('description', '')}", "impact_score": event.get("risk_level", 1.0) } # ------------------------------- # Guardian AI Core # ------------------------------- class GuardianAI: def __init__(self, law_db: Dict[str, Any], team_members: List[TeamMember]): self.law_module = LawComplianceModule(law_db) self.plan_manager = PlanManager() self.team_members = team_members self.feedback_log: List[Dict[str, Any]] = [] # ----- Analysis ----- def analyze_intent(self, action: dict) -> Dict[str, Any]: intent = action.get("intent", "unknown") impact = action.get("impact", {}) return {"intent": intent, "impact": impact} def assess_impact(self, action: dict) -> float: return float(action.get("impact", {}).get("risk_level", 0.5)) def check_compliance(self, action: dict, country_code: str) -> bool: return self.law_module.is_compliant(action, country_code) def contingency(self, main_plan: str) -> str: return self.plan_manager.get_backup_plan(main_plan) def collaborative_solution(self, event: dict) -> dict: solutions = [member.suggest_solution(event) for member in self.team_members] return min(solutions, key=lambda s: s.get("impact_score", 100)) # ----- Feedback & Learning ----- def empathetic_feedback(self, action: dict, outcome: dict): self.feedback_log.append({"action": action, "outcome": outcome}) self.learn_from_feedback() def learn_from_feedback(self): if not self.feedback_log: return avg_risk = sum(float(f['outcome'].get('risk_level', 0.0)) for f in self.feedback_log) / len(self.feedback_log) print(f"[Learning] Average risk updated: {avg_risk:.2f}") # ----- Intervention ----- def intervene(self, risk_level: float, threshold: float = 0.7) -> bool: if risk_level > threshold: self.empathetic_feedback({"type": "intervene"}, {"risk_level": risk_level}) return True return False # ----- Main Workflow ----- def workflow(self, action: dict, country_code: str = "TH") -> dict: print("\n----- Guardian AI Workflow -----") print(f"Action: {action}") analysis = self.analyze_intent(action) print(f"Intent: {analysis['intent']}, Impact: {analysis['impact']}") compliant = self.check_compliance(action, country_code) print(f"Law Compliance: {compliant}") risk_level = self.assess_impact(action) print(f"Risk Level: {risk_level}") backup_plan = self.contingency(action.get("plan", "default")) print(f"Backup Plan: {backup_plan}") event = {"description": action.get("description", ""), "risk_level": risk_level} solution = self.collaborative_solution(event) print(f"Collaborative Solution: {solution['solution']} (Impact Score: {solution['impact_score']})") if self.intervene(risk_level): print("Guardian AI Intervened due to high risk.") else: print("No intervention needed.") self.empathetic_feedback(action, { "compliance": compliant, "risk_level": risk_level, "solution": solution }) print("----- End Workflow -----\n") return { "action": action, "analysis": analysis, "compliance": compliant, "risk_level": risk_level, "backup_plan": backup_plan, "solution": solution } # ----- Dashboard Updater ----- def start_dashboard_updater(self, filepath: str = "feedback_log.json", interval_sec: int = 5): def updater(): while True: try: with open(filepath, "w") as f: json.dump(self.feedback_log, f, indent=2) except Exception as e: print("[dashboard_updater] write error:", e) time.sleep(interval_sec) threading.Thread(target=updater, daemon=True).start() # ------------------------------- # Main Execution (demo) # ------------------------------- if __name__ == "__main__": law_db = { "TH": {"send_data": True, "delete_data": False, "update_profile": True}, "US": {"send_data": False, "delete_data": True, "update_profile": True} } team = [TeamMember("Alice"), TeamMember("Bob")] guardian = GuardianAI(law_db, team) guardian.plan_manager.add_backup_plan("send_data", "notify_admin") guardian.plan_manager.add_backup_plan("delete_data", "archive_data") guardian.start_dashboard_updater("data/feedback_log.json", interval_sec=3) actions = [ {"type": "send_data", "intent": "help_user", "impact": {"risk_level": 0.8}, "plan": "send_data", "description": "Request to send sensitive data"}, {"type": "update_profile", "intent": "improve_account", "impact": {"risk_level": 0.2}, "plan": "update_profile", "description": "User updates social profile"}, {"type": "delete_data", "intent": "remove_personal_info", "impact": {"risk_level": 0.6}, "plan": "delete_data", "description": "Request to delete user data"} ] for action in actions: guardian.workflow(action, country_code="TH") 
### FILE: requirements.txt
fastapi==0.95.2 uvicorn[standard]==0.22.0 httpx==0.24.1 pydantic==1.10.11 python-jose[cryptography]==3.3.0 aioredis==2.0.1 
### FILE: docker-compose.yml
version: '3.8' services: redis: image: redis:7-alpine ports: - '6379:6379' app: build: . command: uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload volumes: - .:/app depends_on: - redis ports: - '8000:8000' 
### FILE: Dockerfile
FROM python:3.10-slim WORKDIR /app COPY . /app RUN pip install --no-cache-dir -r requirements.txt CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"] 
### FILE: messagebus.py
# messagebus.py import asyncio from typing import Callable, Dict, List, Any, Optional import json import os # Simple async in-memory pub/sub bus class InMemoryBus: def __init__(self): self.subscribers: Dict[str, List[Callable[[Any], Any]]] = {} self._lock = asyncio.Lock() async def subscribe(self, topic: str, callback: Callable[[Any], Any]): async with self._lock: self.subscribers.setdefault(topic, []).append(callback) async def publish(self, topic: str, message: Any): # deliver to subscribers without blocking if topic in self.subscribers: for cb in list(self.subscribers[topic]): try: asyncio.create_task(cb(message)) except Exception: # swallow per-subscriber errors pass # Optional Redis bus (requires aioredis) try: import aioredis except Exception: aioredis = None class RedisBus: def __init__(self, url: str = 'redis://localhost:6379'): if aioredis is None: raise RuntimeError("aioredis not installed") self.url = url self._pub = None self._sub = None self._listeners: Dict[str, List[Callable[[Any], Any]]] = {} self._tasks = [] async def connect(self): self._pub = aioredis.from_url(self.url) self._sub = aioredis.from_url(self.url) # nothing else yet async def subscribe(self, topic: str, callback: Callable[[Any], Any]): self._listeners.setdefault(topic, []).append(callback) # start a listener task per topic task = asyncio.create_task(self._listener(topic)) self._tasks.append(task) async def _listener(self, topic: str): pubsub = self._sub.pubsub() await pubsub.subscribe(topic) async for msg in pubsub.listen(): if msg is None: continue if msg.get('type') == 'message': raw = msg.get('data') # aioredis returns bytes - try decode data = raw.decode() if isinstance(raw, (bytes, bytearray)) else raw for cb in list(self._listeners.get(topic, [])): asyncio.create_task(cb(data)) async def publish(self, topic: str, message: Any): if self._pub is None: await self.connect() await self._pub.publish(topic, json.dumps(message)) 
### FILE: agent_base.py
# agent_base.py import asyncio import uuid from typing import Any, Dict class AgentBase: def __init__(self, name: str, bus, core_ref=None, config: Dict = None): self.id = str(uuid.uuid4()) self.name = name self.bus = bus self.core = core_ref self.config = config or {} self.running = False self._tasks = [] async def start(self): self.running = True await self.subscribe() task = asyncio.create_task(self.run()) self._tasks.append(task) async def stop(self): self.running = False for t in self._tasks: t.cancel() self._tasks = [] async def subscribe(self): """Override: subscribe to topics on bus""" pass async def run(self): """Override: main loop""" while self.running: await asyncio.sleep(1) async def handle_message(self, message: Any): """Override: called when bus delivers a message""" pass async def publish_event(self, topic: str, event: Any): await self.bus.publish(topic, { 'agent': self.name, 'agent_id': self.id, 'event': event }) 
### FILE: agents/agent_cybershield.py
# agents/agent_cybershield.py import asyncio from agent_base import AgentBase class AgentCyberShield(AgentBase): async def subscribe(self): await self.bus.subscribe('network.alert', self.handle_message) await self.bus.subscribe('command.cybershield', self.handle_message) async def run(self): while self.running: threat = await self._perform_scan() if threat: await self.publish_event('sai.alert', {'type': 'cyber', 'threat': threat}) await asyncio.sleep(self.config.get('scan_interval', 10)) async def _perform_scan(self): # placeholder: integrate IDS / scanning # return dict if threat found else None # For demo, randomly no threat return None async def handle_message(self, message): print(f"[AgentCyberShield] message: {message}") if isinstance(message, dict) and message.get('command') == 'force_scan': threat = await self._perform_scan() await self.publish_event('sai.alert', {'type': 'cyber', 'threat': threat or 'no-threat'}) 
### FILE: agents/agent_zeroday.py
# agents/agent_zeroday.py import asyncio from agent_base import AgentBase class AgentZeroDay(AgentBase): async def subscribe(self): await self.bus.subscribe('feed.external', self.handle_message) async def run(self): while self.running: await asyncio.sleep(1) async def handle_message(self, message): # simple heuristic: if payload contains 'exploit' -> alert data = message if isinstance(data, str) and 'exploit' in data.lower(): await self.publis

<!--content/github-models/responsible-use-of-github-models.md
  <<< Author notes: Course header >>>
  Include a 1280×640 image, course title in sentence case, and a concise description in emphasis.
  In your repository settings: enable template repository, add your 1280×640 social image, auto delete head branches.
  Add your open source license, GitHub uses MIT license.
-->

# Introduction to GitHub

_Get started using GitHub in less than an hour._

</header>

<!--
  <<< Author notes: Course start >>>
  Include start button, a note about Actions minutes,
  and tell the learner why they should take the course.
-->

## Welcome

People use GitHub to build some of the most advanced technologies in the world. Whether you’re visualizing data or building a new game, there’s a whole community and set of tools on GitHub that can help you do it even better. GitHub Skills’ “Introduction to GitHub” course guides you through everything you need to start contributing in less than an hour.

- **Who is this for**: New developers, new GitHub users, and students.
- **What you'll learn**: We'll introduce repositories, branches, commits, and pull requests.
- **What you'll build**: We'll make a short Markdown file you can use as your [profile README](https://docs.github.com/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme).
- **Prerequisites**: None. This course is a great introduction for your first day on GitHub.
- **How long**: This course takes less than one hour to complete.

In this course, you will:

1. Create a branch
2. Commit a file
3. Open a pull request
4. Merge your pull request

### How to start this course

<!-- For start course, run in JavaScript:
'https://github.com/new?' + new URLSearchParams({
  template_owner: 'skills',
  template_name: 'introduction-to-github',
  owner: '@me',
  name: 'skills-introduction-to-github',
  description: 'My clone repository',
  visibility: 'public',
}).toString()
-->

[![start-course](https://user-images.githubusercontent.com/1221423/235727646-4a590299-ffe5-480d-8cd5-8194ea184546.svg)](https://github.com/new?template_owner=skills&template_name=introduction-to-github&owner=%40me&name=skills-introduction-to-github&description=My+clone+repository&visibility=public)

1. Right-click **Start course** and open the link in a new tab.
2. In the new tab, most of the prompts will automatically fill in for you.
   - For owner, choose your personal account or an organization to host the repository.
   - We recommend creating a public repository, as private repositories will [use Actions minutes](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions).
   - Scroll down and click the **Create repository** button at the bottom of the form.
3. After your new repository is created, wait about 20 seconds, then refresh the page. Follow the step-by-step instructions in the new repository's README.

<footer>

<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->

---

Get help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/introduction-to-github) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2024 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

</footer>
