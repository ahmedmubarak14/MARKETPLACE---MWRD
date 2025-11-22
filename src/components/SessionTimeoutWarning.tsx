import React from 'react';
import { formatTimeRemaining } from '../hooks/useSessionTimeout';

interface SessionTimeoutWarningProps {
  isVisible: boolean;
  timeRemaining: number;
  onExtendSession: () => void;
  onLogout: () => void;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  isVisible,
  timeRemaining,
  onExtendSession,
  onLogout,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 transition-opacity" />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200">
          <div className="p-6">
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <span className="material-symbols-outlined text-3xl text-amber-600">
                schedule
              </span>
            </div>

            {/* Content */}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Session Expiring
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Your session will expire in
              </p>
              <p className="mt-1 text-3xl font-bold text-amber-600">
                {formatTimeRemaining(timeRemaining)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Would you like to stay logged in?
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Log Out
            </button>
            <button
              type="button"
              onClick={onExtendSession}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#0A2540] rounded-lg hover:bg-[#0A2540]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2540] transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
