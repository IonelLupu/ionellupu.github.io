---
title: "IP to Country Detection with GeoPulse.pro"
categories:
    - Utility
tags:
    - GeoPulse
    - IP Geolocation
image: /images/posts/geopulse.jpg
---

Do you want to show the user's country flag, currency, language, or auto-select their country's phone prefix in the checkout form?

For example, amazon.com does it on their website. They automatically preselect your delivery country, language, and currency:
<div style="display: flex; flex-direction: row; gap:12px; align-items: center">
    <img src="/images/posts/geopulse-amazon-2.png" alt="Image 2" width="45%" height="auto">
    <img src="/images/posts/geopulse-amazon.png" alt="Image 1" width="45%" height="auto">
</div>

When building web applications, understanding your user's location can enhance the experience by customizing content, languages, or services.

Many services provide this information about your users, but most of them sell you cloud API access with limited API requests for a small price, or unlimited requests for a huge price.

That's why I built [GeoPulse](https://geopulse.pro/), which gives you offline access to an IP database, eliminating the need for a third-party API. **No requests limit. No latency**. 

In this blog post, I'll walk you through how to get started with [GeoPulse](https://geopulse.pro/) and use it to retrieve your user's information.

### Getting Started
With [GeoPulse](https://geopulse.pro/), you have two options: **offline database** mode (highly recommended for independence from cloud APIs) or **cloud API** (faster to implement, but defeats the purpose).

In this post, we’ll implement the offline method, allowing you to run your own server with simple endpoints to retrieve user information based on their IP.
This server can run on the same machine as your backend, ensuring zero network delays, since you’re not relying on an external cloud API. When you call it, you will get a response similar to this:

![geopulse example response](/images/posts/geopulse-amazon-3.png)

Currently, some fields (city name, latitude, longitude) are unavailable but will be added soon!

#### Step 1: Sign Up and Get Your API Key

To use [GeoPulse](https://geopulse.pro/), head over to the [website](https://geopulse.pro/) and create an account. 
Once logged in, you can get your free API key from the dashboard. This key will be needed to get access to the GeoPulse database.

#### Step 2: Download the GeoPulse server
This is an easy step. Go to the [docs page](https://geopulse.pro/docs) and search for the command that lets you download the binaries for the server.

Or, if you prefer, you can even go to the [Github](https://github.com/GeoPulseData/pulse) page and create your own binaries from the source code. It's open source.

Here are some examples:
```bash
# for linux arm
curl -L https://github.com/GeoPulseData/pulse/raw/main/binaries/GeoPulse-linux-arm -o geopulse
```
Or
```bash
# for macOS arm
curl -L https://github.com/GeoPulseData/pulse/raw/main/binaries/GeoPulse-macos-arm -o geopulse
```
Or
```bash
# for Windows
curl -L https://github.com/GeoPulseData/pulse/raw/main/binaries/GeoPulse-windows.exe -o geopulse
```

Once you have the program, remember to change the execution permissions on it so we can actually run it (might not be needed for Windows):
```bash
chmod +x ./geopulse
```

And now we are ready to run it. Use your API Key you got from the [GeoPulse Dashboard](https://geopulse.pro/dashboard) page:
```shell
./geopulse --key=123abcd-some-other-characters-here
```

You should then see some files being downloaded and your server started. By default, it starts on port `8090`, but you can change that.
Now, we can get any IP, feed it to the `/ip` endpoint and get a JSON back. For example, here is the data for the Google servers IP `http://localhost:8090/ip/8.8.8.8`:
```json
{
	"ip": "8.8.8.8",
	"latitude": "coming soon",
	"longitude": "coming soon",
	"isMobile": "coming soon",
	"city": "coming soon",
	"state": "coming soon",
	"zip": "coming soon",
	"country": {
		"name": "United States",
		"code": "US",
		"capital": "Washington, D.C.",
		"callingCode": "+1",
		"isEUMember": false,
		"currency": {
			"code": "USD",
			"name": "United States dollar",
			"symbol": "$"
		},
		"flag": {
			"png": "https://flagcdn.com/w320/us.png",
			"svg": "https://flagcdn.com/us.svg",
			"emoji": "🇺🇸"
		},
		"continent": {
			"name": "North America",
			"code": "NA"
		},
		"language": {
			"name": "English",
			"code": "eng"
		}
	},
	"timeZone": {
		"name": "coming soon",
		"localTime": "coming soon",
		"localTimeUnix": "coming soon"
	},
	"exchangeRateBaseCurrency": "USD",
	"exchangeRate": 1
}
```

You can customize the baseCurrency if you want like this:
```shell
http://localhost:8090/ip/8.8.8.8?baseCurrency=EUR
```

The `baseCurrency` parameter lets you change the `exchangeRateBaseCurrency`. For example, `baseCurrency=EUR` will return exchange rates between the user's country currency (USD in this case) and EUR.
This allows you to dynamically adjust prices based on the user’s location, converting from EUR (or any currency of your choice) to users' currency (USD in this case). 


