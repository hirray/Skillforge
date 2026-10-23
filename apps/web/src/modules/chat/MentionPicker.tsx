import React from 'react';
import { Avatar } from '../../design-system/components';

export interface MentionMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface MentionPickerProps {
  members: MentionMember[];
  filter: string;
  onSelect: (member: MentionMember) => void;
  onClose: () => void;
}

export const MentionPicker: React.FC<MentionPickerProps> = ({
  members,
  filter,
  onSelect,
  onClose,
}) => {
  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(filter.toLowerCase()) ||
    m.id.toLowerCase().includes(filter.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(filter.toLowerCase()))
  );

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 left-0 w-64 bg-surface border border-uiBorder rounded-xl shadow-elevation-3 overflow-hidden z-30 animate-fade-in">
      <div className="px-3 py-1.5 bg-bg/80 border-b border-uiBorder flex justify-between items-center text-[11px] font-bold text-muted uppercase tracking-wider">
        <span>Mention Team Member</span>
        <button
          type="button"
          onClick={onClose}
          className="hover:text-mainText text-xs leading-none"
        >
          ✕
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto divide-y divide-uiBorder/40">
        {filtered.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => onSelect(member)}
            className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-accent/15 transition-colors text-left text-xs"
          >
            <Avatar name={member.name} email={member.email} size="xs" />
            <div className="flex-1 truncate">
              <span className="font-bold text-mainText block truncate">{member.name}</span>
              {member.role && (
                <span className="text-[10px] text-muted block truncate">{member.role}</span>
              )}
            </div>
            <span className="text-[10px] text-accent font-semibold">@{member.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
