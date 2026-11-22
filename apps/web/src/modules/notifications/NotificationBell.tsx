import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem('token') || 'user-001';

  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/v1/notifications?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUnread();
    } catch (e) {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-[#1b1b22] hover:bg-[#252530] border border-[#282836] text-zinc-300 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8] text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#15151a] border border-[#282836] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn text-xs">
          <div className="p-3 border-b border-[#282836] flex items-center justify-between">
            <span className="font-bold text-white">Notifications ({unreadCount})</span>
            <button
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="text-[11px] text-[#93B2F8] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-[#282836]/50">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  setOpen(false);
                  if (n.link) navigate(n.link);
                }}
                className={`p-3 cursor-pointer hover:bg-[#1b1b22] transition-colors flex items-start justify-between gap-2 ${
                  !n.read ? 'bg-[#0A1680]/10' : ''
                }`}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-white">{n.title}</p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{n.message}</p>
                  <p className="text-[9px] text-zinc-500">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={(e) => handleMarkRead(n.id, e)}
                    title="Mark read"
                    className="w-2 h-2 rounded-full bg-[#93B2F8] mt-1.5 flex-shrink-0"
                  />
                )}
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-4 text-center text-zinc-500">No recent notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const NotificationsInboxPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const token = localStorage.getItem('token') || 'user-001';

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let url = `/api/v1/notifications?limit=50`;
      if (selectedCategory !== 'all') url += `&category=${selectedCategory}`;
      if (unreadOnly) url += `&unreadOnly=true`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/v1/notifications/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [selectedCategory, unreadOnly]);

  const handleSendTestNotif = async () => {
    try {
      await fetch('/api/v1/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: selectedCategory === 'all' ? 'outreach' : selectedCategory,
          title: 'Direct Recruiter Inquiry',
          message: 'Northstar Labs sent you an interview invitation for Senior Systems Architect.',
        }),
      });
      fetchNotifications();
    } catch (e) {}
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/v1/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (e) {}
  };

  const handleTogglePref = async (key: string, val: boolean) => {
    if (!preferences) return;
    const updated = { ...preferences, [key]: val };
    setPreferences(updated);
    try {
      await fetch('/api/v1/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-[#282836] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Notifications & Communication Center</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time auditable signals from hiring pipelines, challenge submissions, and recruiter inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendTestNotif}
            className="px-3 py-1.5 rounded-xl border border-[#93B2F8]/30 hover:border-[#93B2F8] bg-[#0A1680]/20 text-xs font-semibold text-[#93B2F8] transition-colors flex items-center gap-1.5"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v12M2 8h12" />
            </svg>
            <span>Send Test Alert</span>
          </button>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="px-3.5 py-1.5 rounded-xl border border-[#282836] hover:border-[#93B2F8] text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            Preferences
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Preferences Drawer */}
      {showPreferences && preferences && (
        <div className="p-5 bg-[#15151a] border border-[#282836] rounded-2xl space-y-4 text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-[#282836]">
            <div>
              <h2 className="font-bold text-white">Delivery Channel Controls</h2>
              <p className="text-[11px] text-zinc-400">Configure in-app banners and email notifications per category</p>
            </div>
            <button onClick={() => setShowPreferences(false)} className="text-zinc-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'Direct Recruiter Outreach', inAppKey: 'inAppOutreach', emailKey: 'emailOutreach' },
              { label: 'Hiring Pipeline Progress', inAppKey: 'inAppPipeline', emailKey: 'emailPipeline' },
              { label: 'Sponsored Challenges & Hackathons', inAppKey: 'inAppChallenges', emailKey: 'emailChallenges' },
              { label: 'Advisory & Mentorship', inAppKey: 'inAppMentorship', emailKey: 'emailMentorship' },
            ].map((p, idx) => (
              <div key={idx} className="p-3 bg-[#1b1b22] border border-[#282836] rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{p.label}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 text-[11px]">
                    <input
                      type="checkbox"
                      checked={preferences[p.inAppKey] !== false}
                      onChange={(e) => handleTogglePref(p.inAppKey, e.target.checked)}
                      className="rounded border-[#282836] bg-[#15151a]"
                    />
                    <span>In-App</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 text-[11px]">
                    <input
                      type="checkbox"
                      checked={preferences[p.emailKey] !== false}
                      onChange={(e) => handleTogglePref(p.emailKey, e.target.checked)}
                      className="rounded border-[#282836] bg-[#15151a]"
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#282836] pb-3 text-xs">
        <div className="flex items-center gap-1.5">
          {['all', 'outreach', 'pipeline', 'challenge', 'mentorship', 'system'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-zinc-400 text-xs">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded border-[#282836] bg-[#1b1b22]"
          />
          <span>Unread Only</span>
        </label>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-all text-xs flex items-start justify-between gap-4 ${
              !n.read
                ? 'bg-[#15151a] border-[#93B2F8]/30 shadow-sm shadow-[#0A1680]/20'
                : 'bg-[#111116] border-[#22222e] opacity-80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1b1b22] border border-[#282836] flex items-center justify-center text-[#93B2F8] flex-shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{n.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                    {n.category}
                  </span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-4 text-[10px] text-zinc-500 pt-1">
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                  {n.link && (
                    <a href={n.link} className="text-[#93B2F8] hover:underline font-semibold flex items-center gap-1">
                      <span>Jump to Destination</span>
                      <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 3h7v7M13 3 8 8" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {!n.read && (
              <button
                onClick={() => handleMarkAsRead(n.id)}
                className="px-2.5 py-1 rounded-lg border border-[#282836] hover:border-zinc-500 text-[11px] text-zinc-400 hover:text-white transition-colors flex-shrink-0"
              >
                Mark Read
              </button>
            )}
          </div>
        ))}

        {notifications.length === 0 && !loading && (
          <div className="p-12 text-center text-xs bg-[#15151a] rounded-2xl border border-[#282836] space-y-3">
            <p className="text-zinc-400">No notifications found for this view.</p>
            <button
              onClick={handleSendTestNotif}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors"
            >
              Generate Sample Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
