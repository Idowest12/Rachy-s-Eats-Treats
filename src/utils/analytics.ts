// Real-time visitor and outreach analytics tracking helper

export const trackVisit = async () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos';
    const language = navigator.language || 'en';
    const screenWidth = window.innerWidth;
    const device = screenWidth < 768 ? 'mobile' : screenWidth < 1024 ? 'tablet' : 'desktop';

    await fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timezone,
        language,
        device,
        page: window.location.pathname || '/'
      })
    });
  } catch {
    // Non-blocking, fail-safe
  }
};

export const trackOutreach = async (
  channel: 'whatsapp' | 'instagram' | 'phone',
  packageTitle?: string,
  packageId?: number
) => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos';
    const screenWidth = window.innerWidth;
    const device = screenWidth < 768 ? 'mobile' : screenWidth < 1024 ? 'tablet' : 'desktop';

    await fetch('/api/analytics/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel,
        package_title: packageTitle || 'General Consultation / Custom Order',
        package_id: packageId,
        timezone,
        device
      })
    });
  } catch {
    // Non-blocking, fail-safe
  }
};
