import React from 'react';
import { X, Smartphone, MessageSquare, CheckCheck, Clock } from 'lucide-react';
import { SMSNotification } from '../types';

interface SMSNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SMSNotification[];
}

export const SMSNotificationModal: React.FC<SMSNotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Phone Header Banner */}
        <div className="bg-[#0b333a] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Gov-SwasthyaFlow SMS Gateway</h3>
              <p className="text-[11px] text-teal-200">Real-time Patient SMS Delivery Log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explain text for accessibility */}
        <div className="bg-teal-50/70 border-b border-teal-100 px-4 py-2 text-xs text-teal-900 flex items-center justify-between">
          <span>In production, SMS triggers via cellular telecom gateway.</span>
          <span className="font-mono text-[10px] text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
            GSM/SMS Active
          </span>
        </div>

        {/* SMS List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 bg-slate-50">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="text-sm">No SMS messages dispatched yet.</p>
            </div>
          ) : (
            notifications.map((sms) => (
              <div
                key={sms.id}
                className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs relative"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="font-semibold text-teal-800">{sms.recipientName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500">+{sms.phone}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(sms.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-sans">
                  {sms.message}
                </p>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-teal-700">
                    <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Delivered to handset</span>
                  </span>
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    Token: {sms.tokenId}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Close SMS Log
          </button>
        </div>
      </div>
    </div>
  );
};
