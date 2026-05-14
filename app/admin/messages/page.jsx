"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { Modal, Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Icon } from "@iconify/react";

function sortMessagesAsc(messages) {
  if (!messages?.length) return [];
  return [...messages].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
}

function latestMessageTime(messages) {
  if (!messages?.length) return 0;
  return Math.max(
    ...messages.map((m) => new Date(m.created_at).getTime())
  );
}

function sortChatsByLatest(chats) {
  return [...chats].sort(
    (a, b) => latestMessageTime(b.messages) - latestMessageTime(a.messages)
  );
}

function normalizeChats(raw) {
  return sortChatsByLatest(
    (raw || []).map((chat) => ({
      ...chat,
      messages: sortMessagesAsc(chat.messages),
    }))
  );
}

function formatMessageTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleTimeString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
}

function sameCalendarDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [deleteChat, setDeleteChat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select(
          `id, first_name, status, messages(sent_by, application_id, message, created_at)`
        )
        .in("status", ["Step1", "Step2", "Step3"])
        .not("messages", "is", null);

      if (error) {
        console.error("Error fetching chats:", error);
        setChats([]);
        setSelectedChat(null);
      } else {
        const normalized = normalizeChats(data);
        setChats(normalized);
        if (normalized.length > 0) setSelectedChat(normalized[0]);
        else setSelectedChat(null);
      }
      setLoading(false);
    };
    fetchChats();
  }, []);

  const sortedSelectedMessages = useMemo(
    () => sortMessagesAsc(selectedChat?.messages),
    [selectedChat]
  );

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [selectedChat?.id, sortedSelectedMessages.length]);

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        sent_by: "Gidz",
        application_id: selectedChat.id,
        message: newMessage.trim(),
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    const createdAt = new Date().toISOString();
    const msg = {
      sent_by: "Gidz",
      message: newMessage.trim(),
      created_at: createdAt,
    };
    const updatedChat = {
      ...selectedChat,
      messages: [...(selectedChat.messages || []), msg],
    };

    setNewMessage("");
    setSelectedChat(updatedChat);
    setChats((prev) => {
      const next = prev.map((c) =>
        c.id === updatedChat.id ? updatedChat : c
      );
      return sortChatsByLatest(next);
    });
  };

  const handleDeleteClick = (chat) => {
    setDeleteChat(chat);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteChat) return;
    const removedId = deleteChat.id;
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("application_id", removedId);
    if (error) {
      console.error("Error deleting messages:", error);
      return;
    }
    const nextChats = sortChatsByLatest(
      chats.filter((c) => c.id !== removedId)
    );
    setChats(nextChats);
    if (selectedChat?.id === removedId) {
      setSelectedChat(nextChats.length ? nextChats[0] : null);
    }
    setIsModalOpen(false);
    setDeleteChat(null);
  };

  const lastMessage = (chat) => {
    const asc = sortMessagesAsc(chat.messages);
    return asc.length ? asc[asc.length - 1] : null;
  };

  const previewText = (chat) => {
    const m = lastMessage(chat);
    if (!m?.message) return "No messages";
    const text = m.message.trim();
    return text.length > 72 ? `${text.slice(0, 72)}…` : text;
  };

  const conversationList = (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <div className="px-4 py-3 border-b border-appleGray-200 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-appleGray-500">
          Conversations
        </p>
        <p className="text-sm text-appleGray-600 mt-0.5">
          {chats.length} thread{chats.length === 1 ? "" : "s"} · newest first
        </p>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain p-2">
        {chats.length === 0 ? (
          <p className="text-sm text-appleGray-500 px-3 py-8 text-center">
            No conversations yet.
          </p>
        ) : (
          chats.map((chat) => {
            const latest = lastMessage(chat);
            const active = selectedChat?.id === chat.id;
            return (
              <div
                key={chat.id}
                className={`relative rounded-2xl mb-1 transition-colors ${
                  active
                    ? "bg-primary-50 ring-1 ring-primary-200"
                    : "hover:bg-appleGray-50"
                }`}
              >
                <button
                  type="button"
                  className="w-full text-left pl-3 pr-11 py-3 rounded-2xl"
                  onClick={() => {
                    setSelectedChat(chat);
                    setIsDrawerOpen(false);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-appleGray-800 truncate">
                        {chat.first_name}
                      </p>
                      <p className="text-xs text-appleGray-500 mt-0.5">
                        {chat.status}
                      </p>
                      <p className="text-sm text-appleGray-600 mt-1.5 line-clamp-2">
                        {previewText(chat)}
                      </p>
                    </div>
                    {latest?.created_at && (
                      <span className="text-xs text-appleGray-400 shrink-0 tabular-nums">
                        {formatMessageTime(latest.created_at)}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  aria-label={`Delete chat with ${chat.first_name}`}
                  className="absolute top-2 right-2 p-2 rounded-xl text-appleGray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(chat);
                  }}
                >
                  <Icon icon="mdi:delete-outline" className="w-5 h-5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full bg-[#e8edf2]">
      <header className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-appleGray-200/90 bg-white/95 backdrop-blur-md shadow-sm">
        <button
          type="button"
          className="lg:hidden shrink-0 p-2.5 rounded-xl bg-appleGray-100 text-appleGray-800 hover:bg-appleGray-200 transition-colors"
          aria-label="Open conversations"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Icon icon="mdi:menu" className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shrink-0 shadow-sm">
            <Icon icon="mdi:message-text" className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-appleGray-800 leading-tight truncate">
              Admin messages
            </h1>
            <p className="text-xs text-appleGray-500 truncate">
              Applicant chat · full window
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-2 rounded-xl hover:bg-primary-50 transition-colors"
        >
          <Icon icon="mdi:view-dashboard-outline" className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </header>

      <div className="flex-1 flex min-h-0 gap-0 sm:gap-2 p-2 sm:p-3">
        <aside className="hidden lg:flex w-[300px] xl:w-[340px] shrink-0 flex-col min-h-0 rounded-2xl border border-appleGray-200/80 bg-white shadow-sm overflow-hidden">
          {conversationList}
        </aside>

        <section className="flex-1 flex flex-col min-h-0 min-w-0 rounded-2xl border border-appleGray-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-appleGray-500">
              <div className="w-9 h-9 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
              <p className="text-sm">Loading…</p>
            </div>
          ) : selectedChat ? (
            <>
              <div className="shrink-0 px-4 py-3 border-b border-appleGray-100 bg-appleGray-50/80 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-appleGray-800 truncate">
                    {selectedChat.first_name}
                  </h2>
                  <p className="text-xs text-appleGray-500">
                    {selectedChat.status} · {sortedSelectedMessages.length}{" "}
                    message{sortedSelectedMessages.length === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Delete this conversation"
                  className="shrink-0 p-2.5 rounded-xl text-appleGray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => handleDeleteClick(selectedChat)}
                >
                  <Icon icon="mdi:delete-outline" className="w-5 h-5" />
                </button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-5 py-4 space-y-1 bg-gradient-to-b from-appleGray-50/50 to-white"
              >
                {sortedSelectedMessages.map((msg, index) => {
                  const fromGidz = msg.sent_by === "Gidz";
                  const prev = sortedSelectedMessages[index - 1];
                  const showDay =
                    index === 0 ||
                    (prev && !sameCalendarDay(msg.created_at, prev.created_at));

                  return (
                    <div key={`${msg.created_at}-${index}`}>
                      {showDay && (
                        <div className="flex justify-center my-4">
                          <span className="text-[11px] font-medium uppercase tracking-wide text-appleGray-500 bg-appleGray-100/90 px-3 py-1 rounded-full">
                            {formatDayLabel(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex mb-2 ${fromGidz ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[88%] sm:max-w-[72%] rounded-2xl px-3.5 py-2.5 ${
                            fromGidz
                              ? "bg-primary-500 text-white rounded-br-md shadow-sm"
                              : "bg-white text-appleGray-800 border border-appleGray-200 rounded-bl-md shadow-sm"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-between gap-2 text-[11px] mb-1 ${
                              fromGidz
                                ? "text-primary-100"
                                : "text-appleGray-500"
                            }`}
                          >
                            <span className="font-semibold">{msg.sent_by}</span>
                            <time
                              className="tabular-nums opacity-90"
                              dateTime={msg.created_at}
                            >
                              {formatMessageTime(msg.created_at)}
                            </time>
                          </div>
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="shrink-0 p-3 sm:p-4 border-t border-appleGray-200 bg-white">
                <div className="flex gap-2 items-end max-w-4xl mx-auto w-full">
                  <textarea
                    rows={1}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Message… (Shift+Enter for new line)"
                    className="flex-1 min-h-[44px] max-h-32 resize-y px-4 py-3 rounded-2xl border border-appleGray-200 bg-appleGray-50 text-appleGray-800 placeholder:text-appleGray-400 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="shrink-0 h-11 w-11 sm:h-11 sm:px-4 sm:w-auto rounded-2xl bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center justify-center gap-2"
                    aria-label="Send message"
                  >
                    <Icon icon="mdi:send" className="w-5 h-5" />
                    <span className="hidden sm:inline pr-1">Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-appleGray-500">
              <Icon
                icon="mdi:message-outline"
                className="w-14 h-14 text-appleGray-300 mb-3"
              />
              <p className="text-base font-medium text-appleGray-700">
                Select a conversation
              </p>
              <p className="text-sm mt-2 max-w-xs">
                Use the list on the left or open the menu on small screens.
              </p>
            </div>
          )}
        </section>
      </div>

      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          className: "w-[min(100vw-40px,300px)] rounded-r-2xl overflow-hidden",
        }}
      >
        <div className="flex flex-col h-full bg-white">
          <div className="flex items-center justify-between px-1 border-b border-appleGray-100 shrink-0">
            <span className="text-sm font-semibold text-appleGray-800 pl-3 py-2">
              Conversations
            </span>
            <IconButton onClick={() => setIsDrawerOpen(false)} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">{conversationList}</div>
        </div>
      </Drawer>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(calc(100vw-32px),400px)] rounded-3xl bg-white p-6 shadow-lg border border-appleGray-200">
          <h2 className="text-lg font-semibold text-appleGray-800 mb-2">
            Delete conversation?
          </h2>
          <p className="text-sm text-appleGray-600 leading-relaxed">
            All messages for{" "}
            <span className="font-medium text-appleGray-800">
              {deleteChat?.first_name}
            </span>{" "}
            will be removed. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-sm font-medium text-appleGray-700 hover:bg-appleGray-100 transition-colors"
              onClick={() => {
                setIsModalOpen(false);
                setDeleteChat(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              onClick={confirmDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
