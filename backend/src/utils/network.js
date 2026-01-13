const net = require('net');

// Extract the client's IP address, preferring X-Forwarded-For, falling back to req.ip
function getClientIp(req){
  if(!req) return null;
  const xff = req.headers['x-forwarded-for'] || req.headers['x-forwarded-for'.toLowerCase()];
  if(xff){
    // x-forwarded-for may contain a list of IPs
    const parts = xff.split(',').map(p=>p.trim()).filter(Boolean);
    if(parts.length) return parts[0];
  }

  // Some proxies set 'x-real-ip'
  const xrip = req.headers['x-real-ip'];
  if(xrip) return xrip;

  // Express's req.ip takes trust proxy into account when configured
  if(req.ip) return req.ip;

  // Fallback to connection remote address
  return req.connection?.remoteAddress || null;
}

function isPrivateIp(ip){
  if(!ip) return false;
  // strip IPv6 prefix if present
  if(ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
  if(ip === '::1' || ip === '127.0.0.1') return true;

  // IPv4 private ranges
  if(/^10\./.test(ip)) return true;
  if(/^192\.168\./.test(ip)) return true;
  if(/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;

  // Basic IPv6 ULA range (fc00::/7)
  if(/^fc|^fd/.test(ip)) return true;

  return false;
}

module.exports = { getClientIp, isPrivateIp };
