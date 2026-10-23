import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, SkeletonLoader } from '../../design-system/components';

export interface TeamDirectoryProps {
  projectId: string;
  onlineUserIds?: string[];
  onStartDirectChat?: (userId: string) => void;
}

export interface DirectoryMember {
  id: string;
  memberRecordId?: string;
  name: string;
  email?: string;
  role: string;
  responsibilities?: string;
  joinedAt?: string;
  skills?: string[];
  isOwner?: boolean;
}

export const TeamDirectory: React.FC<TeamDirectoryProps> = ({
  projectId,
  onlineUserIds = [],
  onStartDirectChat,
}) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [owner, setOwner] = useState<DirectoryMember | null>(null);
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDirectory = () => {
    setLoading(true);
    fetch(`/api/v1/projects/${projectId}/directory`, {
      headers: { Authorization: `Bearer ${currentUserId}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error.message);
        setOwner(d.data.owner);
        setMembers(d.data.members || []);
        setTotalCount(d.data.totalMembers || 0);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDirectory();
  }, [projectId, currentUserId]);

  const allMembers = [
    ...(owner ? [{ ...owner, isOwner: true }] : []),
    ...members.filter((m) => !owner || m.id !== owner.id),
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-warning text-sm bg-surface rounded-2xl border border-uiBorder">
        <p className="font-bold mb-1">Failed to load Team Directory</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stat */}
      <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-uiBorder shadow-elevation-1">
        <div>
          <h3 className="font-bold text-sm text-primary">Team Directory</h3>
          <p className="text-xs text-muted">
            {totalCount} confirmed team member{totalCount !== 1 ? 's' : ''} working on this project
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-accent/20 text-primary border border-accent/40 rounded-full">
          ● {onlineUserIds.length} online now
        </span>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allMembers.map((member) => {
          const isMe = member.id === currentUserId;
          const isOnline = onlineUserIds.includes(member.id);

          return (
            <Card
              key={member.id}
              className="p-5 flex flex-col justify-between bg-surface rounded-2xl border border-uiBorder shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-0.5 transition-all duration-175"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={member.name}
                      email={member.email}
                      presence={isOnline ? 'online' : 'offline'}
                      size="md"
                      className="border border-uiBorder shadow-sm"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-mainText truncate">
                          {member.name} {isMe && <span className="text-xs text-muted font-normal">(You)</span>}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-accent block truncate">
                        {member.role || 'Contributor'}
                      </span>
                    </div>
                  </div>

                  {member.isOwner && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1680] text-white flex-shrink-0">
                      Owner
                    </span>
                  )}
                </div>

                {member.responsibilities && (
                  <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-3 bg-bg p-2.5 rounded-lg border border-uiBorder/60">
                    {member.responsibilities}
                  </p>
                )}

                {/* Skills tags */}
                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {member.skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-primary border border-accent/25"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 4 && (
                      <span className="text-[10px] text-muted self-center">
                        +{member.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-uiBorder/60 flex items-center justify-between">
                <span className="text-[11px] text-muted">
                  Status:{' '}
                  <span className={isOnline ? 'text-[#22C55E] font-semibold' : 'text-muted'}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </span>

                {!isMe && onStartDirectChat && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartDirectChat(member.id)}
                    className="text-xs py-1 px-3"
                  >
                    💬 Direct Message
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
