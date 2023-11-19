import cookie from "cookie"

export function parseCookies(req) {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie)
}

export function resolveApiHost(req, setLocalhost) {
  var protocol = "https:";
  var host = process.env.NEXT_PUBLIC_BASE_API ?
      process.env.NEXT_PUBLIC_BASE_API :
      req ?
        req.headers["x-forwarded-host"] || req.headers["host"] :
        window.location.host;

  var hostname = host.split(":")[0];
  var port = host.split(":")[1];

  if (host.indexOf("localhost") > -1 || host.indexOf("host.docker.internal") > -1) {
     if (setLocalhost) host = setLocalhost;
     protocol = "http:";
  }

  return {
     protocol,
     host,
     hostname,
     port,
     origin: protocol + "//" + host,
  };
}

export function formatDate (dateString)  {
    const date = new Date(dateString);
    const formattedDate = date.toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];
    return `${formattedDate} ${currentTime}`;
}