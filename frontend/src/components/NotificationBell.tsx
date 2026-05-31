import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, X, Info, AlertTriangle } from 'lucide-react';
import api from '../api/client';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (id: string, message: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      
      // Parse embedded ID if it exists
      if (message.includes('|ID:')) {
        const contractId = message.split('|ID:')[1];
        setShowDropdown(false);
        navigate(`/contracts/${contractId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDropdown = () => {
    const nextState = !showDropdown;
    setShowDropdown(nextState);
    if (nextState && unreadCount > 0) {
      markAllRead();
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="relative p-2.5 text-gray-500 hover:text-gray-900 transition-colors bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF3B30] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="fixed left-72 top-10 ml-6 w-80 bg-white/80 backdrop-blur-2xl rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-white/60 z-50 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="p-5 border-b border-gray-200/50 flex items-center justify-between bg-white/40">
              <h3 className="font-bold text-gray-900 text-sm">Notificações</h3>
              <button 
                onClick={markAllRead}
                className="text-[10px] font-bold text-[#0071E3] hover:text-[#0077ED] transition-colors uppercase tracking-widest"
              >
                Ler todas
              </button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400 text-sm font-medium">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const displayMessage = n.message.split('|ID:')[0];
                  return (
                  <div 
                    key={n.id} 
                    className={`p-5 border-b border-gray-100/50 flex gap-4 transition-colors cursor-pointer ${!n.read ? 'bg-[#0071E3]/5' : 'hover:bg-white/50'}`}
                    onClick={() => handleNotificationClick(n.id, n.message)}
                  >
                    <div className={`p-2.5 rounded-2xl h-fit shadow-sm border border-white/50 ${
                      n.type === 'SUCCESS' ? 'bg-[#34C759]/10 text-[#34C759]' :
                      n.type === 'ALERT' ? 'bg-[#FF9500]/10 text-[#FF9500]' :
                      'bg-[#0071E3]/10 text-[#0071E3]'
                    }`}>
                      {n.type === 'SUCCESS' ? <Check size={16} /> : 
                       n.type === 'ALERT' ? <AlertTriangle size={16} /> : 
                       <Info size={16} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold tracking-tight ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{displayMessage}</p>
                      <p className="text-[10px] text-gray-400 mt-2.5 font-medium">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                )})
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
