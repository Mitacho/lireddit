In development use fastify session cookie settings as below or it will not store your session when you login

```
cookie: {
	secure: !PROD,
	httpOnly: true,
	sameSite: "none",
	maxAge: SESSION_TTL,
},
```
