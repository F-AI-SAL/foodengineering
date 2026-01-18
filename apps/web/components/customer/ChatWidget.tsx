"use client";

import { useMemo, useState } from "react";
import { chatMessages, chatThreads } from "@/lib/data";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Form";
import { EmptyState } from "@/components/design-system/States";

export function ChatWidget() {
  const [message, setMessage] = useState("");
  const thread = chatThreads[0];
  const threadId = thread?.id ?? "";

  const messages = useMemo(() => {
    if (!threadId) {
      return [];
    }

    return chatMessages.filter((msg) => msg.threadId === threadId);
  }, [threadId]);

  if (!thread) {
    return (
      <Card title="Live Support" subtitle="Support chat is ready when a thread is created.">
        <EmptyState title="No chat threads" description="Start a new order to open support chat." />
      </Card>
    );
  }

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }

    setMessage("");
  };

  return (
    <Card title="Live Support" subtitle={`Thread for order ${thread.orderId}`}>
      <div className="flex flex-col gap-md">
        <div className="space-y-sm rounded-lg border border-border bg-surface p-md">
          {!messages.length ? (
            <EmptyState title="No messages yet" description="Start the conversation below." />
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-xs">
                <p className="text-xs text-muted">{msg.senderName}</p>
                <p className="text-sm">{msg.message}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-wrap gap-sm">
          <Input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type your message"
          />
          <Button type="button" variant="primary" onClick={handleSend}>
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}
