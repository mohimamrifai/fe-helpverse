import { useRef, useEffect, useState } from 'react';
import { FaCheckCircle, FaTrash, FaTimes } from 'react-icons/fa';
import type { Notification } from '../services/notification';

interface NotificationPopoverProps {
  notifications: Notification[];
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function NotificationPopover({
  notifications,
  loading,
  isOpen,
  onClose,
  onMarkAsRead,
  onDelete
}: NotificationPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi ukuran layar untuk responsivitas
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Deteksi klik di luar popover untuk menutup popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Format tanggal
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} menit yang lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam yang lalu`;
    } else if (diffDays < 7) {
      return `${diffDays} hari yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={`
        absolute mt-2 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200
        w-[95vw] max-w-[360px] md:right-0 
        ${isMobile ? 'left-1/2 -translate-x-1/2' : 'right-0'}
      `}
    >
      <div className="flex justify-between items-center p-3 bg-primary text-white">
        <h3 className="font-semibold">Notifikasi</h3>
        <button onClick={onClose} className="hover:opacity-80">
          <FaTimes />
        </button>
      </div>

      <div className="max-h-[50vh] md:max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Memuat notifikasi...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Tidak ada notifikasi</div>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li
                key={notification._id || notification.id}
                className={`border-b border-gray-100 last:border-b-0 p-3 ${!notification.isRead ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between">
                  <div className="flex-1 pr-2">
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mb-1 break-words">{notification.message}</p>
                    <span className="text-xs text-gray-500">
                      {formatDate(new Date(notification.createdAt))}
                    </span>
                  </div>
                  <div className="flex items-start space-x-1 ml-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => onMarkAsRead(notification._id || notification.id)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Tandai sebagai telah dibaca"
                      >
                        <FaCheckCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(notification._id || notification.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Hapus notifikasi"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 