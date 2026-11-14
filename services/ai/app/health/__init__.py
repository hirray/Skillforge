from datetime import datetime, timezone
from pathlib import Path
import yaml

CONFIG = yaml.safe_load((Path(__file__).parent / 'thresholds.yaml').read_text())


def date(value):
    if not value:
        return None
    parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    return (parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed.astimezone(timezone.utc)).date()


def compute(project: dict, tasks: list[dict], milestones: list[dict], activity: list[str], now: str, config: dict | None = None) -> dict:
    cfg, signals = {**CONFIG, **(config or {})}, []
    today, pid = date(now), project.get('id', '')
    def add(code, reason, severity, label, tab):
        signals.append({'code': code, 'reason': reason, 'severity': severity, 'weight': cfg['weights'][code], 'action': {'label': label, 'href': f'/projects/{pid}?tab={tab}'}})
    if project.get('status') in ('Paused', 'Completed', 'Verified', 'Archived'):
        return {'status': 'Not scored', 'score': None, 'signals': [], 'reasons': [f'{project["status"]} projects are not scored.'], 'recommendedActions': [], 'sampleSize': len(tasks), 'computedAt': now}
    if not tasks:
        return {'status': 'Not enough data', 'score': None, 'signals': [], 'reasons': ['Not enough activity yet. Add tasks before assessing project health.'], 'recommendedActions': [], 'sampleSize': 0, 'computedAt': now}
    by_id = {task['id']: task for task in tasks}
    for task in tasks:
        if task.get('status') == 'Done':
            continue
        due = date(task.get('dueDate'))
        if due and due < today and task.get('priority') in ('Critical', 'High'):
            code = 'critical_overdue' if task['priority'] == 'Critical' else 'high_overdue'
            add(code, f'{task["priority"]} task “{task["title"]}” overdue by {(today - due).days} days.', 'high' if code == 'critical_overdue' else 'medium', 'Review task deadline', 'Tasks')
        if task.get('needsReassignment') or not task.get('assigneeId'):
            add('reassignment', f'“{task["title"]}” needs an assignee or reassignment.', 'medium', 'Reassign this task', 'Tasks')
        if any(by_id.get(dep, {}).get('status') != 'Done' for dep in task.get('dependsOn', [])):
            add('blocked', f'“{task["title"]}” is blocked by unfinished dependencies.', 'medium', 'Review dependencies', 'Tasks')
    for milestone in milestones:
        due = date(milestone.get('dueDate'))
        if due and due < today and milestone.get('status') != 'Done':
            add('milestone_delay', f'Milestone “{milestone["title"]}” is {(today - due).days} days late.', 'medium', 'Review milestone', 'Milestones')
    timestamps = [date(v) for v in activity + [t.get('updatedAt') for t in tasks] if v]
    last = max(timestamps) if timestamps else None
    if last and (today - last).days >= cfg['inactivity_days']:
        add('inactive', f'No team activity for {(today - last).days} days.', 'medium', 'Open project room', 'Team')
    start, end = date(project.get('createdAt')), date(project.get('targetDate'))
    completion = sum(t.get('status') == 'Done' for t in tasks) / len(tasks)
    if start and end and end > start and (today - start).days / (end - start).days > .75 and completion < .25:
        add('low_completion', 'Less than a quarter of tasks are complete after three quarters of the planned timeline.', 'medium', 'Review delivery scope', 'Tasks')
    severity = sum(signal['weight'] for signal in signals)
    signals.sort(key=lambda s: -s['weight'])
    return {'status': 'Needs Attention' if severity >= cfg['needs_attention'] else 'At Risk' if severity >= cfg['at_risk'] else 'Healthy', 'score': round(max(0, 1 - severity / 20), 2), 'signals': signals, 'reasons': [s['reason'] for s in signals] or ['No current risk signals found in the available tasks and activity.'], 'recommendedActions': list({s['action']['label']: s['action'] for s in signals}.values()), 'sampleSize': len(tasks), 'computedAt': now}
