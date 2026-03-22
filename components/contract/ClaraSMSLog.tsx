'use client'

interface SMSMessage {
  id: string
  content: string
  sentAt: string
  status: 'sent' | 'read' | 'replied'
  replyContent?: string
}

interface ClaraSMSLogProps {
  messages: SMSMessage[]
}

const statusLabel = {
  sent: 'enviado — sem resposta',
  read: 'lido — sem resposta',
  replied: 'respondido',
}

export function ClaraSMSLog({ messages }: ClaraSMSLogProps) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-accent shrink-0" />
          <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
            Msgs da Clara
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="px-3 flex flex-col gap-3 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-1">
            {/* Clara bubble */}
            <div className="rounded-xl rounded-bl-sm border border-accent/15 bg-accent/5 px-3 py-2">
              <p className="text-[10px] text-foreground leading-relaxed">{msg.content}</p>
            </div>

            {/* Reply bubble */}
            {msg.replyContent && (
              <div className="self-end rounded-xl rounded-br-sm border border-border bg-muted/60 px-3 py-2 max-w-[90%]">
                <p className="text-[10px] text-muted-foreground leading-relaxed">{msg.replyContent}</p>
              </div>
            )}

            {/* Timestamp + status */}
            <p className="text-[9px] text-muted-foreground/50 px-1">
              {msg.sentAt} — {statusLabel[msg.status]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
