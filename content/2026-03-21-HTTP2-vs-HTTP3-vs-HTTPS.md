---
title: "HTTP/2 vs HTTP/3 vs HTTPS"
date: "2026-03-21"
tags: ["HLD", "Protocols"]
summary: "Hypertext Transfer Protocol"
category: "HLD"
sessions:
  - date: "2026-03-21"
    startTime: "22:00"
    endTime: "22:38"
---

Imagine you are at a restaurant. **HTTP** (Hypertext Transfer Protocol) is basically the waiter taking your order (your web browser) to the kitchen (the server) and bringing your food (the website's text, images, and videos) back to you.

### 1. HTTP/1.1: The "Stay at the Table" Waiter
In the very early days of the web, every single item you ordered required a new waiter. You order a burger (HTML file), the waiter brings it and leaves. You want fries (an image)? You have to call a *new* waiter, say hello all over again (a network "handshake"), and wait.

The video shows that **HTTP/1.1** (introduced in 1997) fixed this by introducing **"persistent connections."**
* **The Good:** The waiter now stays at your table. You can order the burger, fries, and drink one after the other without saying hello every time.
* **The Bad (Head-of-Line Blocking):** The video highlights a major flaw: the kitchen still cooks and delivers things in a strict line. If the kitchen burns your burger and has to remake it, the waiter just stands there. Your fries and drink might be ready, but they are stuck in line behind the delayed burger.

### 2. HTTP/2: The Multi-Lane Highway (Multiplexing)
By 2015, websites were full of hundreds of images and scripts. Waiting in line was too slow.

* **The Good:** The video visually represents HTTP/2 as a massive upgrade where data is chopped into tiny pieces (called binary frames). Instead of waiting in a single line, these pieces travel down a multi-lane highway all at the exact same time. This is called **Multiplexing**. Your burger, fries, and drink are all being brought to you simultaneously and reassembled at your table.
* **The Bad (TCP Traffic Jams):** HTTP/2 relies on a set of delivery rules called **TCP** (think of them as strict highway patrol officers). TCP demands that *everything* arrives in perfect order. If a delivery truck drops a single fry on the highway (a lost network packet), the TCP officers halt *all the traffic in every lane* until that missing fry is found and redelivered. So, on a spotty Wi-Fi network, one lost packet freezes your entire webpage.

### 3. HTTP/3: The Independent Drones
Standardized in 2022 and built by Google, HTTP/3 was created to fix the traffic jams caused by the strict TCP rules.

* **The Fix (QUIC and UDP):** The video explains that HTTP/3 completely fires the strict TCP highway patrol. Instead, it uses a looser, faster system called **UDP** wrapped in a new technology called **QUIC**.
* **Independent Deliveries:** Because it's no longer forced to keep everything in strict order, every file is treated independently. Think of it like a fleet of delivery drones. One drone has the burger, one has the fries, one has the drink. If the fry drone crashes (a lost packet), *only the fries are delayed*. The burger and drink drones fly straight to your table without stopping!
* **The Magic Trick (Connection Migration):** At the end of the video, it shows a person walking out of their house and their phone switching from Wi-Fi to 5G. With older HTTP versions, changing networks confused the server—it lost your address, and your video would stop buffering. HTTP/3 assigns your phone a unique "Connection ID." Even if you switch networks, the server knows exactly who you are and keeps the video playing completely seamlessly.

**Summary:**
* **HTTP/1.1:** Like a waiter bringing items one by one. If one item is delayed, everything behind it is delayed.
* **HTTP/2:** Delivers everything at once! But if *one* piece gets lost on the way, the whole delivery is frozen until it's found.
* **HTTP/3:** Delivers everything at once using independent drones. If one piece gets lost, the rest of the deliveries keep flying. It's built for the modern, mobile world!



**The Problem: Plain HTTP is a Postcard**
Imagine you are ready to pay for your meal, so you write your credit card number on a simple piece of paper and hand it to the waiter (standard HTTP). This paper is completely open. Anyone who bumps into the waiter, a nosy customer at the next table, or a bad actor sitting in the corner (like a hacker on public Wi-Fi) can easily read your credit card number.

This is because standard HTTP sends data in "plain text."

**The Solution: HTTPS is a Locked Steel Box**
HTTPS (Hypertext Transfer Protocol **Secure**) fixes this by wrapping your standard HTTP messages inside an unbreakable, encrypted shield called **TLS** (Transport Layer Security).

Here is how the restaurant handles your payment securely using HTTPS:

**Step 1: The ID Check (The SSL Certificate)**
Before you even hand over your credit card, you want to make sure you are paying the *real* restaurant, not a scammer who walked in off the street wearing a fake apron. You ask the waiter to show the restaurant's official, city-issued business license.
* *In Tech:* This is the **SSL/TLS Certificate**. Your web browser checks this digital ID card to prove the server is actually your real bank's website and not a fake clone built by a hacker.

**Step 2: The Secret Handshake (The TLS Handshake)**
Now that you trust the restaurant, you need a safe way to send the payment. You and the kitchen manager use a clever trick to agree on a secret code word (a "session key"). You agree on this secret code right in the middle of the crowded restaurant, but the math ensures that *no one else* listening can figure out what the secret word is.
* *In Tech:* This is the **TLS Handshake**. The browser and the server securely exchange mathematical keys so they can encrypt the data.

**Step 3: The Encrypted Delivery (Secure Data Transfer)**
Now, you write your credit card number down, put it inside a heavy steel box, and lock it using that secret code word. You hand the box to the waiter.
* *In Tech:* This is **Encryption**. Your plain text data is scrambled into completely unreadable gibberish.



**The Result:** The hacker in the corner can trip the waiter and steal the box, but it doesn't matter. Without the secret code word, they just have a locked box full of scrambled nonsense. Only the real kitchen manager can unlock it, read your credit card, process the charge, and send your receipt back in the same locked box.

