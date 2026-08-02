'use client';

import * as React from 'react';
import { Server, Zap, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminApiProvidersPage() {
  const providers = [
    { id: '1', name: 'GSM Server Hub API', endpoint: 'https://api.gsm-hub.com/v1', balance: '$1,450.00', status: 'Connected', ping: '42ms' },
    { id: '2', name: 'Mi Unlock Direct Gateway', endpoint: 'https://api.miunlock.org/v2', balance: '$890.50', status: 'Connected', ping: '65ms' },
    { id: '3', name: 'UnlockTool API Server', endpoint: 'https://api.unlocktool.net/v1', balance: '$3,120.00', status: 'Connected', ping: '38ms' },
    { id: '4', name: 'iRemove Bypass API', endpoint: 'https://api.iremove.tools', balance: '$620.00', status: 'Connected', ping: '110ms' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">API Providers</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage external server connections, credentials, and live balance monitoring.</p>
        </div>

        <button className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
          <Plus className="w-4 h-4" />
          <span>Connect API Provider</span>
        </button>
      </div>

      {/* Grid of Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <div key={provider.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#00a65a]/10 text-[#00a65a] flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{provider.name}</h3>
                  <p className="text-xs text-slate-400">{provider.endpoint}</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {provider.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Provider Balance</span>
                <span className="font-extrabold text-slate-800 text-base">{provider.balance}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-medium">Latency</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {provider.ping}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
