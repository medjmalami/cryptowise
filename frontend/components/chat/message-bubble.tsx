'use client';

import { Message } from '@/lib/chat-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageBubbleProps {
  message: Message;
  userAvatar?: string;
  userName?: string;
}

export function MessageBubble({ message, userAvatar, userName }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const messageDate =
    message.timestamp instanceof Date
      ? message.timestamp
      : new Date(message.timestamp as unknown as string | number | Date);

  const formattedTime = Number.isNaN(messageDate.getTime())
    ? '--:--'
    : messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {isUser ? (
          <>
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {userName
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'U'}
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="" alt="AI" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              AI
            </AvatarFallback>
          </>
        )}
      </Avatar>
      <div
        className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-lg px-4 py-2.5 max-w-md text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <p className="break-words">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground px-2">
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
