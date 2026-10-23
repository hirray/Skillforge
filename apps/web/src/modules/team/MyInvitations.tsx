import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../design-system/components';

export const MyInvitations = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem('token') || 'user-001';

  const fetchInvitations = () => {
    setLoading(true);
    fetch('/api/v1/users/me/invitations', {
      headers: { 'Authorization': `Bearer ${currentUserId}` }
    })
      .then(async r => {
        const text = await r.text();
        try {
          const d = JSON.parse(text);
          if (!r.ok || d.error) throw new Error(d.error?.message || `HTTP ${r.status}`);
          return d;
        } catch (err: any) {
          if (err.message && !err.message.includes('JSON')) throw err;
          throw new Error(`Server returned HTTP ${r.status}`);
        }
      })
      .then(d => {
        setInvitations(d.data || []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInvitations();
  }, [currentUserId]);

  const handleRespond = async (invitationId: string, response: 'accept' | 'decline') => {
    setRespondingId(invitationId);
    try {
      const res = await fetch(`/api/v1/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify({ response })
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { throw new Error(`HTTP ${res.status}`); }
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to respond');
      fetchInvitations();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRespondingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending':
        return <Badge className="bg-yellow text-primary">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-accent text-primary">Accepted</Badge>;
      case 'declined':
      case 'rejected':
        return <Badge className="bg-[#E7EAF3] text-[#6B7685]">Declined</Badge>;
      case 'expired':
        return <Badge className="bg-[#E7EAF3] text-[#6B7685] opacity-75">Expired</Badge>;
      default:
        return <Badge status="draft">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-8 text-muted">Loading your invitations...</div>;
  if (error) return <div className="p-8 text-warning">Error: {error}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Invitations</h1>
          <p className="text-muted text-sm mt-1">Logged in as: <span className="font-semibold text-mainText">{currentUserId}</span></p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInvitations}>Refresh</Button>
      </div>

      {invitations.length === 0 ? (
        <Card className="text-center p-12">
          <p className="text-muted mb-4">You have no invitations at the moment.</p>
          <Button variant="outline" onClick={() => navigate('/projects')}>Browse Projects</Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {invitations.map((inv) => (
            <Card key={inv.id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-mainText">{inv.project?.title || 'Untitled Project'}</h2>
                    {getStatusBadge(inv.status)}
                  </div>
                  <p className="text-sm text-muted">
                    Invited for role: <span className="font-semibold text-primary">{inv.role}</span> • Project Owner: <span className="font-medium text-mainText">{inv.project?.ownerId}</span>
                  </p>
                </div>

                {inv.status?.toLowerCase() === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(inv.id, 'accept')}
                      disabled={respondingId === inv.id}
                    >
                      {respondingId === inv.id ? 'Accepting...' : 'Accept Invitation'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRespond(inv.id, 'decline')}
                      disabled={respondingId === inv.id}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>

              {/* Full Project Context */}
              <div className="bg-bg p-4 rounded-lg border border-uiBorder mb-4">
                <h3 className="font-semibold text-sm text-primary mb-2">Project Overview</h3>
                <p className="text-sm text-mainText mb-3">{inv.project?.description || 'No description provided.'}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted">
                  <div>
                    <span className="font-bold block text-mainText">Category</span>
                    {inv.project?.category || 'General'}
                  </div>
                  <div>
                    <span className="font-bold block text-mainText">Stage</span>
                    {inv.project?.stage || 'idea'}
                  </div>
                  <div>
                    <span className="font-bold block text-mainText">Expected Duration</span>
                    {inv.project?.duration || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-bold block text-mainText">Target Date</span>
                    {inv.project?.targetDate ? new Date(inv.project.targetDate).toLocaleDateString() : 'Flexible'}
                  </div>
                </div>
              </div>

              {inv.note && (
                <div className="p-3 bg-yellow/20 border border-yellow/40 rounded text-xs text-primary mb-4">
                  <span className="font-bold">Note from Owner: </span> {inv.note}
                </div>
              )}

              {/* Team context */}
              {inv.project?.members && inv.project.members.length > 0 && (
                <div className="text-xs text-muted">
                  <span className="font-semibold text-mainText">Current Team ({inv.project.members.length} members): </span>
                  {inv.project.members.map((m: any) => `${m.userId} (${m.role})`).join(', ')}
                </div>
              )}

              <div className="mt-3 flex justify-between items-center text-xs text-muted">
                <span>Expires: {new Date(inv.expiresAt).toLocaleDateString()}</span>
                <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${inv.projectId}`)}>View Project Details →</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInvitations;
