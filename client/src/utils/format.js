export function formatTime(dateValue) {
  return new Date(dateValue || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function remainingLabel(limitState) {
  if (!limitState) return '';
  if (limitState.plan === 'subscription_299') return 'Unlimited messages active';
  if (limitState.plan === 'credits_49') return `${limitState.remaining ?? 0} credits remaining`;
  return `${limitState.remaining ?? 0} messages left today`;
}

export function isAstrologyComplete(astrologyData) {
  if (!astrologyData) return false;
  return ['fullName', 'dob', 'time', 'city', 'state', 'country'].every((key) => Boolean(astrologyData[key]));
}

export function hasActiveSubscription(user) {
  return Boolean(user?.isSubscribed && user?.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date());
}

export function openBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
