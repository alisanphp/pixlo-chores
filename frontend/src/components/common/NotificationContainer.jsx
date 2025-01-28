import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../store/notificationSlice';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon
};

const colors = {
  success: 'bg-green-50 text-green-800',
  error: 'bg-red-50 text-red-800',
  warning: 'bg-yellow-50 text-yellow-800',
  info: 'bg-blue-50 text-blue-800'
};

export default function NotificationContainer() {
  const notifications = useSelector(state => state.notifications.items);
  const dispatch = useDispatch();

  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.persistent) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, 5000);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  return (
    <div className="fixed bottom-0 right-0 p-6 space-y-4 z-50">
      {notifications.map(notification => {
        const Icon = icons[notification.type];
        return (
          <div
            key={notification.id}
            className={`${colors[notification.type]} p-4 rounded-lg shadow-lg max-w-sm flex items-start space-x-4`}
          >
            <Icon className="h-6 w-6 flex-shrink-0" />
            <div className="flex-1">
              {notification.title && (
                <h3 className="font-medium">{notification.title}</h3>
              )}
              <p className="text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => dispatch(removeNotification(notification.id))}
              className="flex-shrink-0 ml-4"
            >
              <XCircleIcon className="h-5 w-5 opacity-50 hover:opacity-100" />
            </button>
          </div>
        );
      })}
    </div>
  );
} 