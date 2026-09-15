'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PublicChatApiError,
  createPublicConversation,
  getPublicAgent,
  getPublicConversation,
  sendPublicMessage,
} from '@/lib/api/public-chat';
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from '@/lib/storage/chat-session';
import type {
  AgentPublicInfo,
  ChatSession,
  ChatStatus,
  PublicMessage,
} from '@/types/chat';

interface UsePublicChatReturn {
  agent: AgentPublicInfo | null;
  messages: PublicMessage[];
  status: ChatStatus;
  errorMessage: string | null;
  rateLimitSecondsRemaining: number;
  lastFailedMessage: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  resetConversation: () => void;
  reloadAgent: () => Promise<void>;
}

export function usePublicChat(publicId: string): UsePublicChatReturn {
  const [agent, setAgent] = useState<AgentPublicInfo | null>(null);
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [status, setStatus] = useState<ChatStatus>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitSecondsRemaining, setRateLimitSecondsRemaining] = useState<number>(0);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const rateLimitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef<boolean>(false);

  // Helper to trigger rate-limit cooldown
  const startRateLimitCooldown = useCallback((seconds = 60) => {
    setStatus('rate_limited');
    setRateLimitSecondsRemaining(seconds);

    if (rateLimitTimerRef.current) {
      clearInterval(rateLimitTimerRef.current);
    }

    rateLimitTimerRef.current = setInterval(() => {
      setRateLimitSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (rateLimitTimerRef.current) {
            clearInterval(rateLimitTimerRef.current);
            rateLimitTimerRef.current = null;
          }
          setStatus('ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (rateLimitTimerRef.current) {
        clearInterval(rateLimitTimerRef.current);
      }
    };
  }, []);

  // Initialize agent and restore session
  const initialize = useCallback(async () => {
    if (!publicId || publicId.trim() === '') {
      setStatus('not_found');
      setErrorMessage('No agent ID was provided.');
      return;
    }

    setStatus('initializing');
    setErrorMessage(null);

    try {
      // 1. Fetch Agent public information
      const agentData = await getPublicAgent(publicId);
      setAgent(agentData);

      // 2. Check for an existing stored session in sessionStorage
      const storedSession = getStoredSession(publicId);
      if (storedSession) {
        try {
          const conversationData = await getPublicConversation(
            storedSession.conversationId,
            storedSession.sessionToken,
          );
          setActiveSession(storedSession);
          setMessages(conversationData.messages);
        } catch (convError) {
          // If conversation is 404 or invalid, clear stored session and start clean
          if (convError instanceof PublicChatApiError && convError.isNotFound) {
            clearStoredSession(publicId);
            setActiveSession(null);
            setMessages([]);
          } else if (
            convError instanceof PublicChatApiError &&
            convError.isRateLimited
          ) {
            startRateLimitCooldown();
            return;
          } else {
            // Keep session but show ready state with empty messages
            clearStoredSession(publicId);
            setActiveSession(null);
            setMessages([]);
          }
        }
      }

      setStatus('ready');
    } catch (error) {
      if (error instanceof PublicChatApiError) {
        if (error.isNotFound) {
          setStatus('not_found');
          setErrorMessage('Support agent not found or currently inactive.');
        } else if (error.isRateLimited) {
          startRateLimitCooldown();
        } else {
          setStatus('error');
          setErrorMessage(error.message);
        }
      } else {
        setStatus('error');
        setErrorMessage('Failed to connect to support services. Please try again.');
      }
    }
  }, [publicId, startRateLimitCooldown]);

  useEffect(() => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;
    void initialize();
  }, [initialize]);

  // Reset conversation handler
  const resetConversation = useCallback(() => {
    clearStoredSession(publicId);
    setActiveSession(null);
    setMessages([]);
    setErrorMessage(null);
    setLastFailedMessage(null);
    setStatus('ready');
  }, [publicId]);

  // Send message handler
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || status === 'sending' || status === 'rate_limited') {
        return;
      }

      setErrorMessage(null);
      setLastFailedMessage(null);

      // 1. Establish or reuse session
      let session = activeSession;
      try {
        if (!session) {
          const convRes = await createPublicConversation(publicId);
          session = {
            conversationId: convRes.conversation.id,
            sessionToken: convRes.sessionToken,
          };
          setStoredSession(publicId, session);
          setActiveSession(session);
        }
      } catch (sessionErr) {
        if (sessionErr instanceof PublicChatApiError && sessionErr.isRateLimited) {
          startRateLimitCooldown();
          return;
        }
        setStatus('error');
        setErrorMessage('Could not initialize conversation. Please try again.');
        setLastFailedMessage(trimmed);
        return;
      }

      // 2. Optimistic user message in UI
      const optimisticUserMsg: PublicMessage = {
        id: `optimistic-${Date.now()}`,
        role: 'USER',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticUserMsg]);
      setStatus('sending');

      // 3. Post to backend
      try {
        const assistantMsg = await sendPublicMessage(
          session.conversationId,
          session.sessionToken,
          trimmed,
        );

        // Append assistant reply to messages
        setMessages((prev) => [...prev, assistantMsg]);
        setStatus('ready');
      } catch (sendErr) {
        if (sendErr instanceof PublicChatApiError) {
          if (sendErr.isRateLimited) {
            startRateLimitCooldown();
          } else if (sendErr.isNotFound) {
            // Session became invalid or conversation was purged
            clearStoredSession(publicId);
            setActiveSession(null);
            setStatus('error');
            setErrorMessage('Your session expired. Please start a new conversation.');
          } else {
            setStatus('error');
            setErrorMessage(sendErr.message);
          }
        } else {
          setStatus('error');
          setErrorMessage('Unable to send message. Please check your connection.');
        }
        setLastFailedMessage(trimmed);
      }
    },
    [activeSession, publicId, startRateLimitCooldown, status],
  );

  // Retry handler
  const retryLastMessage = useCallback(async () => {
    if (lastFailedMessage) {
      const msg = lastFailedMessage;
      setLastFailedMessage(null);
      await sendMessage(msg);
    }
  }, [lastFailedMessage, sendMessage]);

  return {
    agent,
    messages,
    status,
    errorMessage,
    rateLimitSecondsRemaining,
    lastFailedMessage,
    sendMessage,
    retryLastMessage,
    resetConversation,
    reloadAgent: initialize,
  };
}
