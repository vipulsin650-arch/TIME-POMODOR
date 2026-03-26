/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Video, X, Clock, Maximize, Minimize } from 'lucide-react';

export default function App() {
  const [time, setTime] = useState(new Date());
  const [background, setBackground] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setBackground({ url, type });
      setIsExpanded(false); // Collapse after upload
    }
  };

  const formatTimeParts = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return { hours: displayHours, minutes: displayMinutes, ampm };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const timeParts = formatTimeParts(time);

  return (
    <div ref={containerRef} className="relative h-screen w-screen flex flex-col items-center justify-center overflow-hidden bg-neutral-900">
      {/* Background Layer */}
      <AnimatePresence mode="wait">
        {background ? (
          <motion.div
            key={background.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            {background.type === 'video' ? (
              <video
                src={background.url}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={background.url}
                alt="Background"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950"
          />
        )}
      </AnimatePresence>

      {/* Clock Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center select-none"
      >
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <h1 className="font-display text-[120px] md:text-[180px] font-black tracking-[-0.08em] text-white leading-[0.8]">
              {timeParts.hours}
              <motion.span 
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity, times: [0, 0.5, 1] }}
                className="inline-block"
              >
                :
              </motion.span>
              {timeParts.minutes}
            </h1>
            <span className="font-display text-2xl md:text-3xl font-bold tracking-tighter text-white/20 italic ml-2">
              {timeParts.ampm}
            </span>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <p className="font-sans text-xs md:text-sm font-medium uppercase tracking-[0.3em] text-white/60">
              {formatDate(time)}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Controls Overlay */}
      <div className="absolute bottom-12 z-30 flex flex-col items-center gap-4">
        <motion.div
          layout
          initial={false}
          animate={{ 
            width: isExpanded ? "auto" : "48px",
            height: "48px",
            borderRadius: isExpanded ? "24px" : "24px"
          }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 overflow-hidden flex items-center shadow-2xl"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!isExpanded ? (
              <motion.button
                key="circle-btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setIsExpanded(true)}
                className="w-12 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                title="Change Background"
              >
                {background ? (
                  <div className="w-6 h-6 rounded-full border-2 border-white/40 overflow-hidden">
                    {background.type === 'video' ? (
                      <div className="w-full h-full bg-white/20" />
                    ) : (
                      <img src={background.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>
                ) : (
                  <ImageIcon size={20} />
                )}
              </motion.button>
            ) : (
              <motion.div
                key="expanded-controls"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center px-2 gap-1"
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 text-white/90 text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Upload size={16} />
                  <span>Upload</span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full hover:bg-white/10 text-white/90 transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>

                {background && (
                  <button
                    onClick={() => {
                      setBackground(null);
                      setIsExpanded(false);
                    }}
                    className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Remove Background"
                  >
                    <X size={16} />
                  </button>
                )}

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/40 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Subtle interaction hint */}
      {!background && (
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-24 text-[10px] uppercase tracking-[0.3em] text-white/20 font-medium"
        >
          Upload an image or video to begin
        </motion.div>
      )}
    </div>
  );
}
