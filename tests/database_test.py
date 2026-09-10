"""Database invariants exercised against the actual generated SQLite migration."""
import sqlite3, pathlib, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class DatabaseTests(unittest.TestCase):
 def setUp(self):
  self.db=sqlite3.connect(':memory:')
  for p in sorted((ROOT/'drizzle').glob('*.sql')): self.db.executescript(p.read_text())
 def add(self,ident,owner='hr-a',job='job-a',hash=None):
  self.db.execute("INSERT INTO tasks (id,owner,job_id,name,source_key,original_key,hash,status,attempts,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",(ident,owner,job,'Candidate','source','original',hash or ident,'pending',0,'2026-09-09T00:00:00Z'))
 def test_duplicate_scoped_to_owner_and_job(self):
  self.add('one',hash='same')
  with self.assertRaises(sqlite3.IntegrityError):self.add('two',hash='same')
  self.add('three',owner='hr-b',hash='same')
  self.add('four',job='job-b',hash='same')
  self.assertEqual(self.db.execute('SELECT COUNT(*) FROM tasks').fetchone()[0],3)
 def test_atomic_lease_ownership_and_recovery(self):
  self.add('a');self.add('b',owner='hr-b')
  sql="UPDATE tasks SET status='processing',attempts=attempts+1,lease_until=? WHERE id=(SELECT id FROM tasks WHERE owner=? AND (status='pending' OR (status='processing' AND lease_until<?)) AND attempts<3 ORDER BY created_at LIMIT 1) AND owner=? RETURNING id"
  self.assertEqual(self.db.execute(sql,('2026-09-09T01:00:00Z','hr-a','2026-09-09T00:00:00Z','hr-a')).fetchone()[0],'a')
  self.assertIsNone(self.db.execute(sql,('2026-09-09T01:00:00Z','hr-a','2026-09-09T00:00:00Z','hr-a')).fetchone())
  self.assertEqual(self.db.execute(sql,('2026-09-09T03:00:00Z','hr-a','2026-09-09T02:00:00Z','hr-a')).fetchone()[0],'a')
  self.assertEqual(self.db.execute("SELECT status FROM tasks WHERE id='b'").fetchone()[0],'pending')
 def test_capacity_enforced_in_insert(self):
  for i in range(1000):self.add(str(i))
  sql="INSERT INTO tasks (id,owner,job_id,name,source_key,original_key,hash,status,attempts,created_at) SELECT ?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM tasks WHERE owner=? AND job_id=?)<1000"
  cursor=self.db.execute(sql,('extra','hr-a','job-a','Name','src','orig','new','pending',0,'2026-09-09','hr-a','job-a'))
  self.assertEqual(cursor.rowcount,0)
  self.assertEqual(self.db.execute('SELECT COUNT(*) FROM tasks').fetchone()[0],1000)
 def test_owner_job_index_used(self):
  plan=str(self.db.execute("EXPLAIN QUERY PLAN SELECT * FROM candidates WHERE owner='hr-a' AND job_id='job-a'").fetchall())
  self.assertIn('USING INDEX',plan)
  self.assertIn('owner=? AND job_id=?',plan)
if __name__=='__main__':unittest.main(verbosity=2)
