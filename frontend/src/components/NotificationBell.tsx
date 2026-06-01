import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, X, Info, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevUnreadCount = useRef(0);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds for real-time feel
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Notify user if a NEW unread notification arrives
    if (unreadCount > prevUnreadCount.current) {
      const latest = notifications.find(n => !n.read);
      if (latest) {
        toast(latest.title, {
          icon: '🔔',
          style: {
            borderRadius: '16px',
            background: '#fff',
            color: '#1d1d1f',
            fontSize: '14px',
            fontWeight: '600'
          },
        });
      }
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('Todas as notificações lidas');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (id: string, message: string) => {
    try {
      // Mark as read immediately in UI
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      
      // Update in backend
      await api.post(`/notifications/${id}/read`);
      
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

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2.5 transition-all duration-300 rounded-2xl border shadow-sm ${
          showDropdown ? 'bg-[#0071E3] text-white border-[#0071E3]' : 'text-gray-500 hover:text-gray-900 bg-white/60 backdrop-blur-md border-white/80 hover:shadow-md'
        }`}
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-bounce' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF3B30] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-4 w-80 bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 origin-top-right">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/40">
              <div>
                <h3 className="font-bold text-gray-900 text-base tracking-tight">Notificações</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{unreadCount} não lidas</p>
              </div>
              <button 
                onClick={markAllRead}
                disabled={loading || unreadCount === 0}
                className="p-2 text-gray-400 hover:text-[#0071E3] disabled:opacity-30 transition-colors"
                title="Marcar todas como lidas"
              >
                <Check size={18} />
              </button>
            </div>
            
            <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={24} className="text-gray-200" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">Você está em dia!</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const displayMessage = n.message.split('|ID:')[0];
                  return (
                  <div 
                    key={n.id} 
                    className={`p-5 border-b border-gray-50 flex gap-4 transition-all cursor-pointer ${!n.read ? 'bg-[#0071E3]/5 hover:bg-[#0071E3]/10' : 'hover:bg-gray-50'}`}
                    onClick={() => handleNotificationClick(n.id, n.message)}
                  >
                    <div className={`p-3 rounded-2xl h-fit shadow-sm border border-white/50 ${
                      n.type === 'SUCCESS' ? 'bg-[#34C759]/10 text-[#34C759]' :
                      n.type === 'WARNING' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' :
                      n.type === 'ALERT' ? 'bg-[#FF9500]/10 text-[#FF9500]' :
                      'bg-[#0071E3]/10 text-[#0071E3]'
                    }`}>
                      {n.type === 'SUCCESS' ? <Check size={16} /> : 
                       n.type === 'WARNING' ? <AlertTriangle size={16} /> : 
                       <Info size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm font-bold tracking-tight leading-tight ${!n.read ? 'text-gray-900' : 'text-gray-500'}`}>{n.title}</p>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-[#0071E3] mt-1.5 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{displayMessage}</p>
                      <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <Clock size={10} />
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )})
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
                <button 
                  onClick={fetchNotifications}
                  className="text-[10px] font-black text-gray-400 hover:text-[#0071E3] transition-colors flex items-center justify-center gap-2 mx-auto uppercase tracking-[0.2em]"
                >
                  <RefreshCw size={12} /> Atualizar Agora
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

