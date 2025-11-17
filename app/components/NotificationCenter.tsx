"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Bell, X, CheckCircle2, AlertTriangle, Clock, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  user: User | null;
}

export default function NotificationCenter({ user }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error loading notifications:", error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    };

    loadNotifications();

    // Écouter les nouvelles notifications
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    await supabase
      .from("user_notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from("user_notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deadline":
        return Calendar;
      case "threshold":
        return AlertTriangle;
      case "reminder":
        return Clock;
      case "achievement":
        return CheckCircle2;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "deadline":
        return "#ef4444";
      case "threshold":
        return "#f59e0b";
      case "reminder":
        return "#2E6CF6";
      case "achievement":
        return "#00D084";
      default:
        return "#6b7280";
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-all hover:bg-gray-800"
        style={{ color: "#9ca3af" }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
            style={{ backgroundColor: "#ef4444" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50 rounded-2xl shadow-2xl border"
              style={{
                backgroundColor: "#14161b",
                borderColor: "#1f232b",
              }}
            >
              <div className="p-4 border-b" style={{ borderColor: "#1f232b" }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-4" style={{ color: "#6b7280" }} />
                    <p className="text-gray-400 text-sm">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const color = getNotificationColor(notification.type);

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                          notification.read ? "bg-gray-800/30" : "bg-gray-800/50"
                        } hover:bg-gray-800/70`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                          if (notification.action_url) {
                            window.location.href = notification.action_url;
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="p-2 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`text-sm font-medium ${notification.read ? "text-gray-400" : "text-white"}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: color }} />
                              )}
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}





