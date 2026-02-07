import { motion } from "framer-motion";

export default function Skeleton({ height = 120 }) {
  return (
    <motion.div
      className="skeleton"
      style={{ height }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.2 }}
    />
  );
}
