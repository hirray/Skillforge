"""Verify that upgrading the original schema preserves every existing column."""
from pathlib import Path
import sqlite3

root=Path(__file__).resolve().parents[1]
baseline=(root/'apps/api/prisma/migrations/20260929_baseline/migration.sql').read_text()
additions=(root/'apps/api/prisma/migrations/20261114_member2_additions/migration.sql').read_text()
with sqlite3.connect(':memory:') as db:
    db.executescript(baseline)
    db.executescript('''
      INSERT INTO User(id,email,roles,updatedAt) VALUES ('compat-owner','compat@example.test','["user"]',CURRENT_TIMESTAMP);
      INSERT INTO Project(id,ownerId,title,updatedAt) VALUES ('compat-project','compat-owner','Original project',CURRENT_TIMESTAMP);
      INSERT INTO ProjectMember(id,projectId,userId) VALUES ('compat-member','compat-project','compat-owner');
      INSERT INTO ProjectRole(id,projectId,title) VALUES ('compat-role','compat-project','Engineer');
      INSERT INTO Task(id,projectId,creatorId,title,updatedAt) VALUES ('compat-task','compat-project','compat-owner','Original task',CURRENT_TIMESTAMP);
      INSERT INTO Milestone(id,projectId,title,updatedAt) VALUES ('compat-ms','compat-project','Original milestone',CURRENT_TIMESTAMP);
      INSERT INTO ChatRoom(id,projectId,updatedAt) VALUES ('compat-room','compat-project',CURRENT_TIMESTAMP);
      INSERT INTO Message(id,roomId,senderId,content,updatedAt) VALUES ('compat-message','compat-room','compat-owner','Original history',CURRENT_TIMESTAMP);
      INSERT INTO ProjectResource(id,projectId,title,addedBy,updatedAt) VALUES ('compat-resource','compat-project','Original link','compat-owner',CURRENT_TIMESTAMP);
      INSERT INTO UserSkill(id,userId,skillId,level) SELECT 'compat-skill','compat-owner',id,'advanced' FROM Skill LIMIT 1;
    ''')
    tables=[r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
    columns={name:[r[1] for r in db.execute(f'PRAGMA table_info("{name}")')] for name in tables}
    def snapshot():
        return {table:db.execute('SELECT '+','.join('"'+c+'"' for c in fields)+' FROM "'+table+'" ORDER BY 1').fetchall() for table,fields in columns.items()}
    before=snapshot();db.executescript(additions)
    assert snapshot()==before,'An original record changed during migration.'
    assert not db.execute('PRAGMA foreign_key_check').fetchall(),'Foreign-key integrity failed.'
    assert db.execute("SELECT name FROM sqlite_master WHERE name='AiMatchRun'").fetchone()
    print(f'PASS: fresh baseline + upgrade; all columns preserved across {len(tables)} original tables; foreign keys valid.')
