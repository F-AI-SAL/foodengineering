"use client";

import { useMemo, useState } from "react";
import { chatMessages, chatThreads } from "@/lib/data";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { Textarea } from "@/components/design-system/Form";
import { EmptyState } from "@/components/design-system/States";

export function ChatInbox() {
  const [activeThreadId, setActiveThreadId] = useState(chatThreads[0]?.id ?? "");
  const [reply, setReply] = useState("");

  const activeThread = chatThreads.find((thread) => thread.id === activeThreadId);
  const messages = useMemo(
    () => chatMessages.filter((message) => message.threadId === activeThreadId),
    [activeThreadId]
  );

  return (
    <Card title="Support Inbox" subtitle="Order-linked chat threads with customers.">
      <div className="grid gap-lg lg:grid-cols-3">
        <div className="space-y-sm lg:col-span-1">
          {!chatThreads.length ? (
            <EmptyState title="No active threads" description="Support chats will show up here." />
          ) : (
            chatThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`focus-ring w-full rounded-lg border border-border px-md py-sm text-left transition-colors ${
                    isActive ? "bg-primary text-primary-contrast" : "bg-surface-alt"
                  }`}
                >
                  <p className="text-sm font-semibold">Order {thread.orderId}</p>
                  <p className={`text-xs ${isActive ? "text-primary-contrast" : "text-muted"}`}>
                    {thread.lastMessage}
                  </p>
                </button>
              );
            })
          )}
        </div>
        <div className="space-y-md lg:col-span-2">
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Thread Details</p>
            <p className="text-xs text-muted">Status: {activeThread?.status ?? "unknown"}</p>
            <div className="mt-md space-y-sm">
              {messages.map((message) => (
                <div key={message.id} className="space-y-xs">
                  <p className="text-xs text-muted">{message.senderName}</p>
                  <p className="text-sm">{message.message}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-sm">
            <Textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Reply to customer"
            />
            <div className="flex flex-wrap gap-sm">
              <Button variant="primary" onClick={() => setReply("")}>
                Send reply
              </Button>
              <Button variant="outline">Mark resolved</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
