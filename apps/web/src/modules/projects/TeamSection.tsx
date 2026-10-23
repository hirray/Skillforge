import { useState, useEffect } from 'react';
import { Card, Button, Badge, Input } from '../../design-system/components';

interface TeamSectionProps {
  projectId: string;
  project: any;
  onProjectUpdated: () => void;
}

export const TeamSection = ({ projectId, project, onProjectUpdated }: TeamSectionProps) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';
  const isOwner = project?.ownerId === currentUserId;

  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [pendingTransfer, setPendingTransfer] = useState<any>(null);
  const [myPendingInvitation, setMyPendingInvitation] = useState<any>(null);
  const [isRespondingInvite, setIsRespondingInvite] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ userId: '', role: '', note: '', expiresDays: 7 });

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinForm, setJoinForm] = useState({ role: '', message: '' });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ targetUserId: '', role: '', responsibilities: '' });

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeForm, setRemoveForm] = useState({ targetUserId: '', reason: '' });

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferNewOwnerId, setTransferNewOwnerId] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectForm, setRejectForm] = useState({ requestId: '', reason: '', version: 1 });

  const [actionError, setActionError] = useState<string | null>(null);

  const isMember = members.some(m => m.userId === currentUserId && m.status === 'active');
  const activeMembers = members.filter(m => m.status === 'active');
  const historicalMembers = members.filter(m => m.status !== 'active');

  const fetchTeamData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      // 1. Fetch members
      const membersRes = await fetch(`/api/v1/projects/${projectId}/members`);
      const membersData = await membersRes.json();
      setMembers(membersData.data || []);

      // 2. If owner, fetch project invitations and join requests
      if (isOwner) {
        const invRes = await fetch(`/api/v1/projects/${projectId}/invitations`, {
          headers: { 'Authorization': `Bearer ${currentUserId}` }
        });
        const invData = await invRes.json();
        setInvitations(invData.data || []);

        const reqRes = await fetch(`/api/v1/projects/${projectId}/join-requests`, {
          headers: { 'Authorization': `Bearer ${currentUserId}` }
        });
        const reqData = await reqRes.json();
        setJoinRequests(reqData.data || []);

        // Fetch users for invite picker
        const usersRes = await fetch('/api/v1/users');
        const usersData = await usersRes.json();
        setAvailableUsers(usersData.data || []);
      } else {
        // For non-owner, check if current user has an invitation to this project
        const myInvRes = await fetch('/api/v1/users/me/invitations', {
          headers: { 'Authorization': `Bearer ${currentUserId}` }
        });
        const myInvData = await myInvRes.json();
        const pendingInvite = (myInvData.data || []).find((inv: any) =>
          inv.projectId === projectId &&
          (inv.status?.toLowerCase() === 'pending')
        );
        setMyPendingInvitation(pendingInvite || null);
      }

      // 3. Fetch pending ownership transfer
      const transferRes = await fetch(`/api/v1/projects/${projectId}/transfer-ownership`, {
        headers: { 'Authorization': `Bearer ${currentUserId}` }
      });
      const transferData = await transferRes.json();
      setPendingTransfer(transferData.data);

    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [projectId, isOwner, currentUserId]);

  const handleSendInvite = async () => {
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify(inviteForm)
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to send invite');
      setShowInviteModal(false);
      setInviteForm({ userId: '', role: '', note: '', expiresDays: 7 });
      fetchTeamData();
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const handleSendJoinRequest = async () => {
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify(joinForm)
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to submit join request');
      setShowJoinModal(false);
      setJoinForm({ role: '', message: '' });
      alert('Join request submitted successfully!');
      fetchTeamData();
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const handleRespondJoinRequest = async (requestId: string, action: 'accept' | 'reject', reason?: string, version?: number) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/join-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify({ action, reason, version })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Action failed');
      setShowRejectModal(false);
      fetchTeamData();
      onProjectUpdated();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateRole = async () => {
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/members/${roleForm.targetUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify({ role: roleForm.role, responsibilities: roleForm.responsibilities })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to update role');
      setShowRoleModal(false);
      fetchTeamData();
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeForm.reason.trim()) {
      return setActionError('A reason is required to remove a member.');
    }
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/members/${removeForm.targetUserId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify({ reason: removeForm.reason })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to remove member');
      setShowRemoveModal(false);
      setRemoveForm({ targetUserId: '', reason: '' });
      fetchTeamData();
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const handleLeaveProject = async () => {
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify({ reason: leaveReason })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to leave project');
      setShowLeaveModal(false);
      setLeaveReason('');
      fetchTeamData();
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const handleInitiateTransfer = async () => {
    if (!transferNewOwnerId) return setActionError('Please select a member.');
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/transfer-ownership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify({ newOwnerId: transferNewOwnerId })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Transfer failed');
      setShowTransferModal(false);
      fetchTeamData();
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const handleRespondTransfer = async (action: 'accept' | 'decline') => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/transfer-ownership/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Response failed');
      fetchTeamData();
      onProjectUpdated();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRespondMyInvite = async (invitationId: string, response: 'accept' | 'decline') => {
    setIsRespondingInvite(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify({ response })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to respond to invitation');
      setMyPendingInvitation(null);
      await fetchTeamData();
      onProjectUpdated();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setIsRespondingInvite(false);
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
        return <Badge className="bg-[#E7EAF3] text-[#6B7685]">{status}</Badge>;
      case 'expired':
        return <Badge className="bg-[#E7EAF3] text-[#6B7685] opacity-75">Expired</Badge>;
      default:
        return <Badge status="draft">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-4 text-muted">Loading team formation data...</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner for Pending Invitation to Current User */}
      {myPendingInvitation && !isMember && (
        <Card className="bg-accent/20 border-2 border-accent p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🎉</span>
                <h3 className="font-bold text-primary text-base">You've Been Invited to Join This Team!</h3>
                <Badge className="bg-primary text-white">{myPendingInvitation.role}</Badge>
              </div>
              <p className="text-sm text-mainText">
                The project owner has invited you to join the team as a <strong>{myPendingInvitation.role}</strong>.
              </p>
              {myPendingInvitation.note && (
                <p className="text-xs text-muted italic mt-1.5 bg-white/80 p-2.5 rounded-lg border border-uiBorder">
                  "{myPendingInvitation.note}"
                </p>
              )}
              <p className="text-xs text-muted mt-1.5">
                Expires: {new Date(myPendingInvitation.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => handleRespondMyInvite(myPendingInvitation.id, 'accept')}
                disabled={isRespondingInvite}
              >
                {isRespondingInvite ? 'Accepting...' : 'Accept Invitation'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRespondMyInvite(myPendingInvitation.id, 'decline')}
                disabled={isRespondingInvite}
              >
                Decline
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Top Banner for Pending Ownership Transfer */}
      {pendingTransfer && pendingTransfer.status === 'Pending' && (
        <Card className="bg-yellow/20 border-yellow/40 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-primary">Ownership Transfer in Progress</h3>
              <p className="text-sm text-mainText">
                {pendingTransfer.newOwnerId === currentUserId ? (
                  <span>You have been designated as the new owner of this project! Accept to take over ownership.</span>
                ) : isOwner ? (
                  <span>Ownership transfer to <strong>{pendingTransfer.newOwnerId}</strong> is awaiting their acceptance. You retain owner permissions until they accept.</span>
                ) : (
                  <span>An ownership transfer to <strong>{pendingTransfer.newOwnerId}</strong> is pending.</span>
                )}
              </p>
            </div>
            {pendingTransfer.newOwnerId === currentUserId && (
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => handleRespondTransfer('accept')}>Accept Ownership</Button>
                <Button variant="outline" size="sm" onClick={() => handleRespondTransfer('decline')}>Decline</Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-mainText">Team Members ({activeMembers.length})</h2>
          <p className="text-sm text-muted">Project capacity: {project.minTeamSize} min - {project.maxTeamSize} max members</p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button size="sm" onClick={() => setShowInviteModal(true)}>Invite Member</Button>
              {activeMembers.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowTransferModal(true)}>Transfer Ownership</Button>
              )}
            </>
          )}

          {!isOwner && !isMember && myPendingInvitation && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleRespondMyInvite(myPendingInvitation.id, 'accept')}
                disabled={isRespondingInvite}
              >
                Accept Invite
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRespondMyInvite(myPendingInvitation.id, 'decline')}
                disabled={isRespondingInvite}
              >
                Decline
              </Button>
            </div>
          )}

          {!isOwner && !isMember && !myPendingInvitation && project.joinMode !== 'invite' && (
            <Button size="sm" onClick={() => setShowJoinModal(true)}>Request to Join</Button>
          )}

          {isMember && !isOwner && (
            <Button variant="outline" size="sm" onClick={() => setShowLeaveModal(true)}>Leave Project</Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-warning/20 border border-warning/40 text-warning rounded-lg text-sm">
          {actionError}
        </div>
      )}

      {/* Active Members Grid */}
      <div className="grid gap-4">
        {/* Project Owner Card */}
        <Card className="flex justify-between items-center border-l-4 border-primary p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-mainText">{project.ownerId}</h3>
                <Badge className="bg-primary text-white">Project Owner</Badge>
              </div>
              <p className="text-xs text-muted">Primary project lead & manager</p>
            </div>
          </div>
        </Card>

        {/* Members List */}
        {activeMembers.length === 0 ? (
          <Card className="text-center p-8">
            <p className="text-muted text-sm mb-3">No other active team members yet.</p>
            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => setShowInviteModal(true)}>Invite your first collaborator</Button>
            )}
          </Card>
        ) : (
          activeMembers.map((member) => (
            <Card key={member.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold">
                  {member.userId.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-mainText">{member.user?.email || member.userId}</h3>
                    <Badge className="bg-accent text-primary">{member.role}</Badge>
                  </div>
                  {member.responsibilities && (
                    <p className="text-xs text-mainText mt-1">
                      <span className="font-semibold text-muted">Responsibilities: </span>{member.responsibilities}
                    </p>
                  )}
                  <p className="text-xs text-muted mt-1">
                    Joined: {new Date(member.joinedAt).toLocaleDateString()}
                  </p>

                  {/* Role History dropdown/display */}
                  {member.roleHistories && member.roleHistories.length > 0 && (
                    <div className="mt-2 text-xs text-muted bg-bg p-2 rounded border border-uiBorder">
                      <span className="font-bold text-mainText">Role History: </span>
                      {member.roleHistories.map((h: any) => (
                        <div key={h.id}>• Changed from <em>{h.fromRole}</em> to <strong>{h.toRole}</strong> by {h.changedBy} on {new Date(h.changedAt).toLocaleDateString()}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isOwner && member.userId !== project.ownerId && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRoleForm({ targetUserId: member.userId, role: member.role, responsibilities: member.responsibilities || '' });
                      setShowRoleModal(true);
                    }}
                  >
                    Edit Role
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-warning border-warning/30 hover:bg-warning/10"
                    onClick={() => {
                      setRemoveForm({ targetUserId: member.userId, reason: '' });
                      setShowRemoveModal(true);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Historical Members (Left / Removed) */}
      {historicalMembers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Past Team Members ({historicalMembers.length})</h3>
          <div className="grid gap-3">
            {historicalMembers.map((m) => (
              <Card key={m.id} className="p-3 bg-bg/50 opacity-80 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-mainText">{m.user?.email || m.userId}</span> • Past Role: <span className="font-medium">{m.role}</span>
                  <p className="text-muted mt-0.5">
                    {m.status === 'removed' ? `Removed: ${m.removalReason || 'No reason provided'}` : `Left: ${m.leaveReason || 'Voluntary departure'}`} ({m.leftAt ? new Date(m.leftAt).toLocaleDateString() : ''})
                  </p>
                </div>
                <Badge className="bg-[#E7EAF3] text-[#6B7685]">{m.status}</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Owner-Only: Pending Invitations & Join Requests Panels */}
      {isOwner && (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Sent Invitations */}
          <Card className="p-5">
            <h3 className="font-bold text-primary mb-4 flex items-center justify-between">
              <span>Invitations Sent</span>
              <span className="text-xs font-normal text-muted">{invitations.length} total</span>
            </h3>

            {invitations.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No invitations sent yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-3 bg-bg rounded-lg border border-uiBorder text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-mainText">{inv.user?.email || inv.userId}</span>
                        {getStatusBadge(inv.status)}
                      </div>
                      <p className="text-muted mt-1">Role: <span className="text-primary font-medium">{inv.role}</span></p>
                      {inv.note && <p className="text-muted italic mt-0.5">"{inv.note}"</p>}
                      <p className="text-muted text-[10px] mt-1">Expires: {new Date(inv.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Join Requests */}
          <Card className="p-5">
            <h3 className="font-bold text-primary mb-4 flex items-center justify-between">
              <span>Join Requests</span>
              <span className="text-xs font-normal text-muted">{joinRequests.filter(r => r.status === 'Pending').length} pending</span>
            </h3>

            {joinRequests.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No join requests received.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {joinRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-bg rounded-lg border border-uiBorder text-xs flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-mainText">{req.user?.email || req.userId}</span>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-muted mt-0.5">Requested Role: <span className="font-medium text-primary">{req.role}</span></p>
                      </div>
                    </div>

                    {req.message && (
                      <p className="text-mainText bg-white p-2 rounded border border-uiBorder/50">"{req.message}"</p>
                    )}

                    {req.status === 'Pending' && (
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          size="sm"
                          onClick={() => handleRespondJoinRequest(req.id, 'accept', undefined, req.version)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRejectForm({ requestId: req.id, reason: '', version: req.version });
                            setShowRejectModal(true);
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* -------------------- MODALS -------------------- */}

      {/* 1. Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white">
            <h3 className="text-lg font-bold text-primary mb-4">Invite Candidate to Team</h3>
            
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <label className="font-semibold block text-mainText mb-1">Select Candidate</label>
                <select
                  className="w-full p-2 border border-uiBorder rounded-lg bg-bg"
                  value={inviteForm.userId}
                  onChange={e => setInviteForm({ ...inviteForm, userId: e.target.value })}
                >
                  <option value="">-- Choose a user --</option>
                  {availableUsers
                    .filter(u => u.id !== project.ownerId && !activeMembers.some(m => m.userId === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.email} ({u.id})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block text-mainText mb-1">Select or Enter Role</label>
                <select
                  className="w-full p-2 border border-uiBorder rounded-lg bg-bg mb-2"
                  value={inviteForm.role}
                  onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                >
                  <option value="">-- Choose a role --</option>
                  {project.roles && project.roles.length > 0 && (
                    <optgroup label="Project Open Roles">
                      {project.roles.map((r: any) => (
                        <option key={r.id || r.title} value={r.title}>
                          {r.title} ({r.openings - (r.filled || 0)} openings left)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Standard Roles">
                    {['Frontend Developer', 'Backend Developer', 'Fullstack Engineer', 'UI/UX Designer', 'ML Engineer', 'Mobile Developer', 'DevOps / Cloud', 'Product Manager'].map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </optgroup>
                </select>
                <input
                  type="text"
                  className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-xs"
                  placeholder="Or enter custom role name..."
                  value={inviteForm.role}
                  onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                />
              </div>

              <Input
                label="Personal Note (Optional)"
                value={inviteForm.note}
                onChange={e => setInviteForm({ ...inviteForm, note: e.target.value })}
                placeholder="We loved your profile and would love to build this together!"
              />

              <Input
                type="number"
                label="Expires in (Days)"
                value={inviteForm.expiresDays}
                onChange={e => setInviteForm({ ...inviteForm, expiresDays: Number(e.target.value) })}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button onClick={handleSendInvite} disabled={!inviteForm.userId || !inviteForm.role}>Send Invitation</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 2. Request to Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white">
            <h3 className="text-lg font-bold text-primary mb-4">Request to Join Project</h3>
            
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <label className="font-semibold block text-mainText mb-1">Select or Enter Role</label>
                <select
                  className="w-full p-2 border border-uiBorder rounded-lg bg-bg mb-2"
                  value={joinForm.role}
                  onChange={e => setJoinForm({ ...joinForm, role: e.target.value })}
                >
                  <option value="">-- Choose a role --</option>
                  {project.roles && project.roles.length > 0 && (
                    <optgroup label="Project Open Roles">
                      {project.roles.map((r: any) => (
                        <option key={r.id || r.title} value={r.title}>{r.title}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Standard Roles">
                    {['Frontend Developer', 'Backend Developer', 'Fullstack Engineer', 'UI/UX Designer', 'ML Engineer', 'Mobile Developer', 'DevOps / Cloud', 'Product Manager'].map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </optgroup>
                </select>
                <input
                  type="text"
                  className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-xs"
                  placeholder="Or enter target role title..."
                  value={joinForm.role}
                  onChange={e => setJoinForm({ ...joinForm, role: e.target.value })}
                />
              </div>

              <Input
                label="Message to Owner (Optional)"
                value={joinForm.message}
                onChange={e => setJoinForm({ ...joinForm, message: e.target.value })}
                placeholder="Briefly explain your background or interest in this project..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowJoinModal(false)}>Cancel</Button>
              <Button onClick={handleSendJoinRequest} disabled={!joinForm.role}>Submit Request</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 3. Reject Join Request Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white">
            <h3 className="text-lg font-bold text-primary mb-2">Decline Join Request</h3>
            <p className="text-xs text-muted mb-4">
              The applicant will receive a respectful notification without any comparison to other applicants.
            </p>

            <Input
              label="Optional Reason / Feedback"
              value={rejectForm.reason}
              onChange={e => setRejectForm({ ...rejectForm, reason: e.target.value })}
              placeholder="e.g. This role has already been filled or requires additional experience."
            />

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button
                variant="outline"
                className="text-warning border-warning/30"
                onClick={() => handleRespondJoinRequest(rejectForm.requestId, 'reject', rejectForm.reason, rejectForm.version)}
              >
                Confirm Rejection
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 4. Edit Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white">
            <h3 className="text-lg font-bold text-primary mb-4">Edit Member Role</h3>
            
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <label className="font-semibold block text-mainText mb-1">Select or Enter Role</label>
                <select
                  className="w-full p-2 border border-uiBorder rounded-lg bg-bg mb-2"
                  value={roleForm.role}
                  onChange={e => setRoleForm({ ...roleForm, role: e.target.value })}
                >
                  <option value="">-- Choose role --</option>
                  {project.roles && project.roles.length > 0 && (
                    <optgroup label="Project Open Roles">
                      {project.roles.map((r: any) => (
                        <option key={r.id || r.title} value={r.title}>{r.title}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Standard Roles">
                    {['Frontend Developer', 'Backend Developer', 'Fullstack Engineer', 'UI/UX Designer', 'ML Engineer', 'Mobile Developer', 'DevOps / Cloud', 'Product Manager'].map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </optgroup>
                </select>
                <Input
                  label="Role Title"
                  value={roleForm.role}
                  onChange={e => setRoleForm({ ...roleForm, role: e.target.value })}
                />
              </div>

              <Input
                label="Responsibilities Description"
                value={roleForm.responsibilities}
                onChange={e => setRoleForm({ ...roleForm, responsibilities: e.target.value })}
                placeholder="e.g. Leads frontend development and UI polish..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
              <Button onClick={handleUpdateRole}>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 5. Remove Member Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white">
            <h3 className="text-lg font-bold text-warning mb-2">Remove Member from Team</h3>
            
            {project.status === 'Active' && activeMembers.length === 1 && (
              <div className="p-3 bg-warning/20 border border-warning/40 text-warning rounded text-xs mb-4">
                <strong>Warning:</strong> You are removing the last active collaborator on this <strong>Active</strong> project. The project will remain active with only you.
              </div>
            )}

            <p className="text-xs text-muted mb-4">
              Member historical participation will be preserved in records, but their active status will end.
            </p>

            <Input
              label="Reason for Removal (Required)"
              value={removeForm.reason}
              onChange={e => setRemoveForm({ ...removeForm, reason: e.target.value })}
              placeholder="e.g. Inactive participation or requested removal"
            />

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowRemoveModal(false)}>Cancel</Button>
              <Button
                className="bg-warning text-white"
                onClick={handleRemoveMember}
                disabled={!removeForm.reason.trim()}
              >
                Confirm Removal
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 6. Leave Project Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white">
            <h3 className="text-lg font-bold text-warning mb-2">Leave Project</h3>
            <p className="text-xs text-muted mb-4">
              Are you sure you want to leave this project? Your past contributions will remain recorded.
            </p>

            <Input
              label="Reason for Leaving (Optional)"
              value={leaveReason}
              onChange={e => setLeaveReason(e.target.value)}
              placeholder="e.g. Schedule conflicts"
            />

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
              <Button className="bg-warning text-white" onClick={handleLeaveProject}>Confirm Leave</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 7. Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white">
            <h3 className="text-lg font-bold text-primary mb-2">Transfer Project Ownership</h3>
            <p className="text-xs text-muted mb-4">
              Designate a current active member to take over project ownership. You will remain the project owner until they explicitly accept the transfer.
            </p>

            <div>
              <label className="font-semibold block text-mainText text-sm mb-1">Select New Owner</label>
              <select
                className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-sm"
                value={transferNewOwnerId}
                onChange={e => setTransferNewOwnerId(e.target.value)}
              >
                <option value="">-- Choose active member --</option>
                {activeMembers.map(m => (
                  <option key={m.id} value={m.userId}>{m.user?.email || m.userId} ({m.role})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowTransferModal(false)}>Cancel</Button>
              <Button onClick={handleInitiateTransfer} disabled={!transferNewOwnerId}>Send Transfer Request</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamSection;
