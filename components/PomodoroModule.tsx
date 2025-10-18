import React, { useState, useEffect, useCallback, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.ts';
import { PlayIcon, StopIcon, RefreshIcon, CogIcon, XCircleIcon } from './Icons.tsx';

const SettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: { work: number; break: number };
    onSave: (settings: { work: number; break: number }) => void;
}> = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-slide-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">タイマー設定</h2>
                    <button onClick={onClose}><XCircleIcon className="w-7 h-7 text-slate-400"/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">集中時間 (分)</label>
                        <input
                            type="number"
                            value={localSettings.work}
                            onChange={(e) => setLocalSettings(s => ({ ...s, work: parseInt(e.target.value, 10) }))}
                            className="w-full p-2 border bg-white border-slate-300 rounded-lg mt-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">休憩時間 (分)</label>
                        <input
                            type="number"
                            value={localSettings.break}
                            onChange={(e) => setLocalSettings(s => ({ ...s, break: parseInt(e.target.value, 10) }))}
                            className="w-full p-2 border bg-white border-slate-300 rounded-lg mt-1"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">保存</button>
                </div>
            </div>
        </div>
    );
};

const PomodoroModule: React.FC = () => {
    const [settings, setSettings] = useLocalStorage<{ work: number; break: number }>('pomodoroSettings', { work: 25, break: 5 });
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [timeLeft, setTimeLeft] = useState(settings.work * 60);
    const [isActive, setIsActive] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setTimeLeft(settings[mode] * 60);
    }, [settings, mode]);

    const switchMode = useCallback(() => {
        const nextMode = mode === 'work' ? 'break' : 'work';
        setMode(nextMode);
        setTimeLeft(settings[nextMode] * 60);
        if (audioRef.current) {
            audioRef.current.play();
        }
    }, [mode, settings]);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            switchMode();
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isActive, timeLeft, switchMode]);

    useEffect(() => {
        if (!isActive) {
            setTimeLeft(settings[mode] * 60);
        }
    }, [settings, mode, isActive]);

    const progress = (settings[mode] * 60 - timeLeft) / (settings[mode] * 60) * 100;

    return (
        <div className="p-4 space-y-6">
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSave={setSettings}
            />
            <div className="bg-white rounded-xl shadow-md p-6 text-center relative">
                <button onClick={() => setIsSettingsOpen(true)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <CogIcon className="w-6 h-6"/>
                </button>
                <div className="mb-4">
                    <span className={`px-4 py-1 rounded-full text-sm font-bold ${mode === 'work' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {mode === 'work' ? '集中' : '休憩'}
                    </span>
                </div>
                <div className="text-7xl font-mono font-bold text-slate-800 my-4">
                    {formatTime(timeLeft)}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
                    <div className={`h-2.5 rounded-full transition-all duration-500 ${mode === 'work' ? 'bg-blue-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-center items-center gap-4">
                    <button onClick={() => setIsActive(!isActive)} className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105">
                        {isActive ? <StopIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                    </button>
                    <button onClick={resetTimer} className="p-3 bg-slate-200 text-slate-600 rounded-full shadow-md hover:bg-slate-300">
                        <RefreshIcon className="w-6 h-6"/>
                    </button>
                </div>
                 <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" preload="auto" className="hidden"></audio>
            </div>
        </div>
    );
};

export default PomodoroModule;
