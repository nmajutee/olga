import { listMessages } from "@/lib/messages";
import { PageHeader } from "@/components/admin/page-header";
import { MessageInbox } from "@/components/admin/message-inbox";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await listMessages(200);
  const unread = messages.filter((message) => !message.readAt).length;

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={unread ? `${unread} unread` : "All read"}
        title="Messages"
        description="Every contact-form enquiry, archived here whether or not the email went out."
      />
      <MessageInbox messages={messages} />
    </div>
  );
}
