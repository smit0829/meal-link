const origin = "http://localhost:5173";
fetch("http://localhost:5000/api/auth/register", {
    method: "OPTIONS",
    headers: {
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type"
    }
}).then(res => {
    console.log(res.status, res.headers.get("access-control-allow-origin"));
    return res.text();
}).then(console.log).catch(console.error);
