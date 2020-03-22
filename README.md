# lsot

Setup:
```
npm i @types/node js-yaml @types/js-yaml express @types/express socket.io @types/socket.io
tsc generate.ts
```

To start server:
```
node generate.js && tsc *.ts --esModuleInterop
node server.js
```

View debug app at http://localhost:3000/
