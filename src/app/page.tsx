"use client";

import { useState, useRef, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Store, Loader2, ArrowRight, ChevronRight } from "lucide-react";

function SlideToEnter({ onComplete }: { onComplete: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(false);
  const x = useMotionValue(0);

  const getMaxX = useCallback(() => {
    if (!trackRef.current) return 260;
    return trackRef.current.offsetWidth - 60;
  }, []);

  const progress = useTransform(x, [0, 260], [0, 1]);
  const textOpacity = useTransform(progress, [0, 0.5], [1, 0]);
  const checkOpacity = useTransform(progress, [0.8, 1], [0, 1]);
  const trackBg = useTransform(
    progress,
    [0, 1],
    ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.12)"]
  );

  const handleDragEnd = useCallback(() => {
    const maxX = getMaxX();
    const currentX = x.get();

    if (currentX > maxX * 0.75) {
      animate(x, maxX, { type: "spring", stiffness: 300, damping: 30 });
      setCompleted(true);
      setTimeout(onComplete, 400);
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }, [getMaxX, x, onComplete]);

  return (
    <motion.div
      ref={trackRef}
      className="slide-track"
      style={{ background: trackBg }}
    >
      <motion.span className="slide-hint" style={{ opacity: textOpacity }}>
        滑动解锁商业洞察
        <ChevronRight className="w-4 h-4 inline-block ml-0.5 animate-pulse" />
      </motion.span>

      <motion.div
        className="slide-thumb"
        drag="x"
        dragConstraints={trackRef}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05 }}
        whileHover={{ scale: 1.02 }}
      >
        {completed ? (
          <motion.div style={{ opacity: checkOpacity }}>
            <Loader2 className="w-5 h-5 animate-spin" />
          </motion.div>
        ) : (
          <ArrowRight className="w-5 h-5" />
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const router = useRouter();
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = async () => {
    if (isEntering) return;
    setIsEntering(true);

    try {
      const result = await signIn("credentials", {
        username: "admin",
        password: "123",
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setIsEntering(false);
    }
  };

  return (
    <main className="min-h-screen landing-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="landing-glow landing-glow-1" />
      <div className="landing-glow landing-glow-2" />

      {/* Subtle grid */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-2xl text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/[0.1] backdrop-blur-sm mb-8"
        >
          <Store className="w-8 h-8 text-white/70" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="landing-title mb-4"
        >
          Shopify Insight AI
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="landing-subtitle mb-12"
        >
          AI 驱动的 Shopify 店铺全维度商业智能分析平台
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-14 flex-wrap"
        >
          {["店铺全维度解析", "AI 深度洞察", "竞品情报分析", "数据驱动评分"].map((label, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full text-xs tracking-wide text-white/50 bg-white/[0.04] border border-white/[0.08]"
            >
              {label}
            </span>
          ))}
        </motion.div>

        {/* Slider */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex justify-center"
        >
          <SlideToEnter onComplete={handleEnter} />
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-[11px] text-white/20 mt-12 tracking-wide"
        >
          Powered by Google Gemini &middot; Real-time Intelligence
        </motion.p>
      </motion.div>
    </main>
  );
}
