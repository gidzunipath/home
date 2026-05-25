"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { FaPaperPlane, FaComments, FaUser, FaUserTie } from "react-icons/fa";

export default function Message() {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchApplicant = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          first_name,
          status,
          messages(
            sent_by,
            application_id,
            message,
            created_at
          )
          `
        )
        .eq("id", id)
        .in("status", ["Step1", "Step2", "Step3"])
        .single();

      if (error) {
        console.error("Error fetching applicant:", error);
      } else {
        setApplicant(data);
      }
    };

    fetchApplicant();
  }, [id]);

  const sendMessage = async () => {
    if (applicant && newMessage.trim() !== "" && !sending) {
      setSending(true);

      const { error } = await supabase.from("messages").insert([
        {
          sent_by: applicant.first_name,
          application_id: applicant.id,
          message: newMessage,
        },
      ]);

      if (error) {
        console.error("Error sending message:", error);
      } else {
        // Update local state by appending the new message
        applicant.messages.push({
          sent_by: applicant.first_name,
          message: newMessage,
          created_at: new Date().toISOString(),
        });
        setNewMessage("");
        setApplicant({ ...applicant });
      }

      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col bg-white h-[80vh] rounded-2xl overflow-hidden">
      {applicant ? (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FaComments className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Chat with GIDZ Uni Path</h3>
                <p className="text-sm text-sky-100">
                  Get help from our counselors
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-appleGray-50 space-y-4">
            {applicant.messages?.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaComments className="w-6 h-6 text-sky-500" />
                </div>
                <p className="text-appleGray-500 font-medium">
                  No messages yet
                </p>
                <p className="text-sm text-appleGray-400 mt-1">
                  Start a conversation with your counselor
                </p>
              </div>
            ) : (
              applicant.messages?.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sent_by === applicant.first_name
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      msg.sent_by === applicant.first_name
                        ? "bg-sky-500 text-white"
                        : "bg-white border border-appleGray-200 text-appleGray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {msg.sent_by === applicant.first_name ? (
                        <FaUser className="w-3 h-3" />
                      ) : (
                        <FaUserTie className="w-3 h-3" />
                      )}
                      <span className="text-xs font-medium opacity-75">
                        {msg.sent_by}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <span className="text-xs opacity-60 mt-1 block">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-appleGray-200">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-appleGray-300 rounded-2xl shadow-soft bg-appleGray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-soft ${
                  sending || !newMessage.trim()
                    ? "bg-appleGray-300 text-appleGray-500 cursor-not-allowed"
                    : "bg-sky-500 hover:bg-sky-600 text-white hover:shadow-medium"
                }`}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaPaperPlane className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <FaComments className="w-6 h-6 text-sky-500" />
            </div>
            <p className="text-appleGray-600">Loading messages...</p>
          </div>
        </div>
      )}
    </div>
  );
}
