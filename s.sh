#!/bin/sh
file=".env"
nx="NX_PUBLIC_"
e="8CqHsc1kw41fG09u4R7A0"
echo $nx'URL=https://console.qovery.com' >> $file
echo $nx'QOVERY_API=https://api.qovery.com' >> $file
echo $nx'QOVERY_WS=wss://ws.qovery.com' >> $file
echo $nx'OAUTH_DOMAIN=auth.qovery.com' >> $file
echo $nx'OAUTH_KEY=S4fQF5rkTng'$e >> $file
echo $nx'OAUTH_AUDIENCE=https://core.qovery.com' >> $file
echo $nx'POSTHOG=__test__posthog__token' >> $file
echo $nx'POSTHOG_APIHOST=__test__environment__posthog__apihost' >> $file
cat $file
