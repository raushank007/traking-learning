---
title: "Sliding window"
date: "2026-03-15"
tags: ["LeetCode", "Coding", "Sliding window"]
summary: "sliding window cheat sheet"
category: "Coding"
sessions:
  - date: "2026-03-15"
    startTime: "10:07"
    endTime: "10:39"
---
### 🪟 Sliding Window Pattern Cheat Sheet

**The Core Concept**
The Sliding Window is a highly optimized two-pointer technique ($O(N)$ time complexity) used to track a contiguous subset of data. Instead of recalculating overlapping elements from scratch, you "slide" a window over the data by adding the new element on the right and removing the old element on the left.

**How to Identify It**
Look for these three criteria in the problem description:

1. **Data Structure:** An Array or a String.
2. **Keyword:** "Contiguous," "Subarray," or "Substring."
3. **Goal:** Find a Maximum, Minimum, Longest, Shortest, or a Target Value.

---

### 1. Fixed-Size Window Template

**When to use:** The problem asks for a subarray/substring of a specific, fixed length `k`.
**The Strategy:** 1. **Expand** the right edge.
2. **Process** the window once it reaches size `k`.
3. **Slide** the window by removing the left element and incrementing the left pointer.

```java
public int fixedWindow(int[] arr, int k) {
    int left = 0;
    int currentState = 0; // Tracks sum, product, etc.
    int bestResult = Integer.MIN_VALUE; // Use MIN_VALUE for max queries, MAX_VALUE for min queries

    for (int right = 0; right < arr.length; right++) {
        // 1. EXPAND
        currentState += arr[right];

        // Check if window has reached size 'k'
        if (right - left + 1 == k) {
            // 2. PROCESS
            bestResult = Math.max(bestResult, currentState);
            
            // 3. SLIDE
            currentState -= arr[left]; 
            left++;                    
        }
    }
    return bestResult; // Return the optimal result found
}

```

---

### 2. Variable-Size Window Template (Longest)

**When to use:** The window size is unknown. You need to find the longest contiguous segment that meets a specific *condition* (e.g., sum <= target).
**The Strategy:**

1. **Expand** the right edge to add to the current state.
2. **Shrink** the left edge using a `while` loop *as long as the condition is violated*.
3. **Process** and update the best result once the window is valid again.

```java
public int variableWindow(int[] arr, int target) {
    int left = 0;
    int currentState = 0; 
    int bestResult = 0; // Use 0 for longest

    for (int right = 0; right < arr.length; right++) {
        // 1. EXPAND
        currentState += arr[right];

        // 2. SHRINK (Execute while the window is INVALID)
        // Note: left <= right ensures we don't break if the window needs to shrink to size 0
        while (currentState > target && left <= right) {
            currentState -= arr[left];
            left++;
        }

        // 3. PROCESS (Window is now VALID)
        // Length of current window is (right - left + 1)
        bestResult = Math.max(bestResult, right - left + 1); 
    }
    return bestResult;
}

```

---

### 3. Variable-Size Window Template (Shortest)

**When to use:** The problem asks for the *shortest* or *minimum* contiguous segment that meets a specific condition.
**The Strategy:**

1. **Expand** the right edge to add to the current state.
2. **Process & Shrink** the left edge using a `while` loop *as long as the window is VALID*.

```java
public int shortestVariableWindow(int[] arr, int target) {
    int left = 0;
    int currentState = 0; 
    // Initialize to MAX_VALUE because we are looking for the minimum
    int minLen = Integer.MAX_VALUE; 

    for (int right = 0; right < arr.length; right++) {
        // 1. EXPAND
        currentState += arr[right];

        // 2. PROCESS AND SHRINK (Execute while the window is VALID)
        while (currentState >= target && left <= right) {
            // Update the minimum length found so far
            minLen = Math.min(minLen, right - left + 1); 
            
            // Shrink the window from the left
            currentState -= arr[left];
            left++;
        }
    }
    
    // If minLen wasn't updated, return 0 (or another appropriate default)
    return minLen == Integer.MAX_VALUE ? 0 : minLen;
}

```

---

### 4. Advanced State Tracking ($O(1)$ Lookups)

When the problem asks you to track the *contents* of the window (like finding the longest substring with unique characters), simple integer arithmetic isn't enough.

* **Strings/Characters:** Use an integer array (e.g., `int[] chars = new int[128]`) to track character frequencies in $O(1)$ time.
* **Arbitrary Integers:** Use a `HashMap<Integer, Integer>` to track frequencies of elements within the window.

**Example Update inside the Loop:**

```java
// Expand
freqMap.put(arr[right], freqMap.getOrDefault(arr[right], 0) + 1);

// Shrink condition example (e.g., if we only allow k distinct elements)
while (freqMap.size() > k && left <= right) { ... }

```

---

### ⚠️ 5. Common Pitfalls & Traps

**The Negative Number Trap**
Variable-size windows rely on **monotonicity**—meaning the state changes predictably in one direction.

* If you are tracking a sum, adding positive numbers *always* increases the sum, and removing them *always* decreases it. This makes the `while` loop shrinking logic safe.
* **The Trap:** If the array contains **negative numbers**, adding a number might *decrease* the sum. Your `while` loop will prematurely shrink the window, missing valid answers.
* **The Fix:** If an array has negative numbers and asks for a target sum, abandon the sliding window. Use the **Prefix Sum + HashMap** pattern instead.

