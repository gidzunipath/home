export function sortMessagesAsc(messages) {
  if (!messages?.length) return [];
  return [...messages].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
}

export function countUnansweredConversations(applications) {
  if (!applications?.length) return 0;

  return applications.filter((app) => {
    const messages = sortMessagesAsc(app.messages);
    const last = messages[messages.length - 1];
    return last && last.sent_by !== "Gidz";
  }).length;
}
