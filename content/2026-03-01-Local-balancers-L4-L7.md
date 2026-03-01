---
title: "Local balancers(L4/L7)"
date: "2026-03-01"
tags: ["HLD", "Networking & Communication"]
summary: "Local balancers Layer 4 and Layer 7"
category: "HLD"
sessions:
  - date: "2026-03-01"
    startTime: "10:00"
    endTime: "10:30"
---

# Local Balancers (L4/L5)

Imagine a load balancers as a traffic cop standing in front of a row of identical restaurants.If a massive crow arrived , the cop directs people to different doors so no single restaurant get overwhelmed.

To decide where to send traffic, load balancers usually operates at one of two levels:
1. Layer 4 : This load balancer only looks at the outside of the envelope,It sees the destination IP address and the port number.It doesn't open the request to actual path.It just routes the request to next available server.
2. Layer 7 : This load balancer actually opens the request and read the request.It actually see what path we need to route it and based on it it make decision where we need to route it.

## Layer 4(Transport) Load balancing Deep dive

Layer 4 is go-to when system requires pure-speed handles millions of concurrent connections, or deals with non-HTTP traffic(like multiplayer gaming or live video streaming over UDP).
1. The Mechanism(NAT) : When a client sends a request, the L4 load balancer intercepts the TCP or UDP packets.IT typically users **Network Address Translation(NAT)**.It takes the packet, swaps the destination IP address(which was the load balancers IP) with the IP address of the chosen backend server, and forwards it along
2. The Connection : It essentially acts as transport router.The TCP connection conceptually exists directly between the client and the backend server.
3. The PROS : It is incredibly fast, introduces almost zero latency, and uses very little CPU/memory on the load balancer itself.
4. The CONS : It cannot make smart routing decisions.If you have a microservice architecture where Server A handles user profiles and server B handles billing , and L4 load balancer cannot route traffic based on those URLs because it cannot read the application data.

Question: To keep our system highly available,load balancers need to stop sending traffic to server that have crashed.Since an L4 load balancer cannot read HTTP messages(like a 200 ok status code), how do you think it checks if a backend server is actually "healthy" and ready to receive traffic?
 
L4 load balancer monitors health at the network level, Here is how it works:
1. The TCP ping : The load balancer periodically attempts to establish a fresh TCP connection with the backend server independently of user traffic.
2. The Handshake: It sends a SYN packet, if the server is alive and the port is open, it replies with a SYN-ACK.
3. The verdict : Once the load balancer receives that reply,it knows the server is healthy.It then immediately closes this test connection.If the request times out or the connection is refused, the server is marked "unhealthy" and the load balancer stop routing new user traffic to it.

## Layer 7(Application) Load balancer

**Question**: Think about a major limitation of the L4 health check we just metioned.What if the backend server's network port is perfectly fine(so it passes the L4 TCP check). but the web application running on it has a bug and is running 500 internal server Error to everyone?

Since a Layer 7 load balancer operates differently, how do you think it would handle this exact situation?

Layer 7 goes much deeper for checking the health of the connection 
1. The HTTP ping : Instead of just checking if the network port is open, it sends a real HTTP request to a specific endpoint on our server like GET/health
2. The Application Verdict: It explicitly looks for an HTTP 200 OK response. If our web app has a bug and returns a 500 Internal Server Error, the L7 load balancer knows the application itself is failing. It marks the server as unhealthly and routes traffic, even if the underlying network connection was perfectly fine.

**Deep Dive Layer 7**
1. The Mechanism(Reverse Proxy): Unlike L4, which just swaps IP addresses and passes packets through, L7 actually terminates the connection from the client. It completely unpacks the HTTP request, looks at the URL path, headers, or cookies, and then opens a brand new connection to the appropriate backend server to forward the request.
2. The Pros : It allows for incredibly smart routing. You can do path-based routing (e.g., sending /video requests to high-storage servers and /api requests to high-compute servers). It can also handle SSL termination (decrypting HTTPS traffic at the load balancer so your backend servers don't have to waste CPU doing it).
3. The Cons : Because it has to stop, unpack, read, and recreate connections, it requires more processing power and introduces slightly more latency than L4.

## L4 vs L7 : Trade-offs and Architecture Scenarios

**Question**
Let's test out what we've covered so far with a real-world system design scenario. Imagine you are designing a highly competitive multiplayer online game where player movements must be synced to the server with the absolute minimum latency possible.

Would you choose a Layer 4 or a Layer 7 load balancer for routing this real-time game traffic, and why?

## Routing Algorithms & high Availability

3 core algorithms:
1. Round Robin: The simplest method. It just goes down the list sequentially. Request 1 goes to Server A, Request 2 to Server B, Request 3 to Server C, and Request 4 goes back to Server A.
2. Least Connections: The load balancer keeps track of how many active, open connections each server currently has. It sends the new request to whichever server is currently the least busy.
3. IP Hash (Sticky Sessions): The load balancer runs a mathematical formula (a hash) on the client's IP address. This guarantees that a specific user is always routed to the exact same backend server for every single request they make during their session.

**Question**
Let's test this with an interview scenario. Imagine you are designing a legacy e-commerce checkout system where a user's shopping cart data is stored temporarily in the local memory (RAM) of the specific server they first connected to.

Which of those three routing algorithms would you be forced to use to ensure the user doesn't suddenly lose their cart data when they click "Proceed to Checkout"?