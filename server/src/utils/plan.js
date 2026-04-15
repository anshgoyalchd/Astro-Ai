export function hasActiveSubscription(user) {
  return Boolean(user.isSubscribed && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date());
}

export function getRemainingFreeMessages(chat) {
  return Math.max(5 - (chat?.messageCount || 0), 0);
}

export function getChatLimitState(user, chat) {
  if (hasActiveSubscription(user)) {
    return { allowed: true, plan: 'subscription_299', remaining: null };
  }

  if ((user.chatCredits || 0) > 0) {
    return { allowed: true, plan: 'credits_49', remaining: user.chatCredits };
  }

  const remaining = getRemainingFreeMessages(chat);
  return { allowed: remaining > 0, plan: 'free', remaining };
}
