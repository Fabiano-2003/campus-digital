import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  FileText,
  Users,
  User,
  Home,
  MessageCircle,
  X,
  ChevronRight,
  Building,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Início", href: "/dashboard" },
  { icon: UserPlus, label: "Seguir", href: "/follow" },
  { icon: BookOpen, label: "Biblioteca", href: "/library" },
  { icon: Users, label: "Grupos", href: "/groups" },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: FileText, label: "Documentos", href: "/documents" },
  { icon: Building, label: "Instituições", href: "/institutions" },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-card border-r",
          "md:relative md:translate-x-0 md:z-auto",
          !isOpen && "md:w-16"
        )}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.div
              animate={{ opacity: isOpen ? 1 : 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <span className="font-bold text-lg text-primary">SaberAngola</span>
            </motion.div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <motion.div
                  key={item.label}
                  onHoverStart={() => setHoveredItem(item.label)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className="relative"
                >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-12 transition-all duration-200",
                      !isOpen && "md:justify-center md:w-12",
                      isActive && "bg-primary/10 text-primary border-primary/20"
                    )}
                    onClick={() => {
                      navigate(item.href);
                      onClose();
                    }}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <motion.span
                      animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
                      className="ml-3 overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                    {isActive && isOpen && (
                      <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </Button>

                {/* Tooltip for collapsed state */}
                <AnimatePresence>
                  {!isOpen && hoveredItem === item.label && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-full top-0 ml-2 bg-popover border rounded-md px-2 py-1 text-sm shadow-md whitespace-nowrap hidden md:block z-50"
                    >
                      {item.label}
                    </motion.div>
                  )}
                </AnimatePresence>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
};