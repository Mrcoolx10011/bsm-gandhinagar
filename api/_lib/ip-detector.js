/**
 * IP Detection Utility
 * Extracts client IP address from request headers (Vercel/serverless compatible)
 */

/**
 * Get client IP address from request
 * Priority order for Vercel/serverless environments
 */
export function getClientIP(req) {
  // Priority 1: x-forwarded-for (standard proxy header)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Priority 2: x-real-ip (alternative proxy header)
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }

  // Priority 3: Direct socket connection
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress;
  }

  // Priority 4: Connection object
  if (req.connection?.remoteAddress) {
    return req.connection.remoteAddress;
  }

  // Fallback
  return 'Unknown';
}

/**
 * Parse User Agent to extract OS and Browser info
 */
export function parseUserAgent(userAgent) {
  if (!userAgent) {
    return { os: 'Unknown', browser: 'Unknown' };
  }

  // Parse OS
  let os = 'Unknown';
  if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10';
  else if (userAgent.includes('Windows NT 11.0')) os = 'Windows 11';
  else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (userAgent.includes('Windows NT 6.2')) os = 'Windows 8';
  else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) {
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    os = match ? `macOS ${match[1].replace('_', '.')}` : 'macOS';
  }
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('iPhone')) os = 'iOS (iPhone)';
  else if (userAgent.includes('iPad')) os = 'iOS (iPad)';
  else if (userAgent.includes('Android')) {
    const match = userAgent.match(/Android (\d+\.\d+)/);
    os = match ? `Android ${match[1]}` : 'Android';
  }

  // Parse Browser
  let browser = 'Unknown';
  if (userAgent.includes('Edg/')) {
    const match = userAgent.match(/Edg\/(\d+\.\d+)/);
    browser = match ? `Edge ${match[1]}` : 'Edge';
  }
  else if (userAgent.includes('Chrome/')) {
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    browser = match ? `Chrome ${match[1]}` : 'Chrome';
  }
  else if (userAgent.includes('Firefox/')) {
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    browser = match ? `Firefox ${match[1]}` : 'Firefox';
  }
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    browser = match ? `Safari ${match[1]}` : 'Safari';
  }
  else if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) {
    browser = 'Opera';
  }

  return { os, browser };
}
