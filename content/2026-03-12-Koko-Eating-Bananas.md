---
title: "875. Koko Eating Bananas"
date: "2026-03-12"
tags: ["LeetCode", "Coding", "Binary search"]
summary: "Sliding Window 1"
category: "Coding"
sessions:
  - date: "2026-03-11"
    startTime: "04:31"
    endTime: "05:39"
---




**Problem:** 875. Koko Eating Bananas
**Pattern:** Binary Search on Answer Space


**1. The "Why" (The Core Intuition):**
The search space for Koko's eating speed is strictly monotonic. If she can eat all bananas at speed `k`, she can definitely eat them at speed `k + 1`. Because the answer space `[1, max(piles)]` is sorted and monotonic, we can use Binary Search to find the left-most valid boundary (the minimum speed).

**2. Complexity:**

* **Time:** $O(N \log M)$ — Where $N$ is the number of piles and $M$ is the maximum pile size. We do $O(N)$ work to check the hours for $\log M$ different speeds.
* **Space:** $O(1)$ — No extra memory is allocated.

**3. State Trace (Tabular Method):**
`piles = [30, 11, 23, 4, 20]`, `h = 6`
*Initial Bounds:* `low = 1`, `high = 30`, `optimalSpeed = -1`

| `low` | `high` | `mid` (Speed) | Hours Required | Condition (`hours <= h`) | Action |
| --- | --- | --- | --- | --- | --- |
| 1 | 30 | 15 | 2+1+2+1+2 = 8 | 8 <= 6 (False) | Too slow. `low = mid + 1` (16) |
| 16 | 30 | 23 | 2+1+1+1+1 = 6 | 6 <= 6 (True) | Works! Record `ans = 23`. Try slower: `high = 22` |
| 16 | 22 | 19 | 2+1+2+1+2 = 8 | 8 <= 6 (False) | Too slow. `low = 20` |
| 20 | 22 | 21 | 2+1+2+1+1 = 7 | 7 <= 6 (False) | Too slow. `low = 22` |
| 22 | 22 | 22 | 2+1+2+1+1 = 7 | 7 <= 6 (False) | Too slow. `low = 23`. Loop breaks. |

**Final Answer:** `23`

**4. SDE 3 Clean Code (Java):**

```java
class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int low = 1;
        int high = 0;
        
        // Find the maximum possible speed required (eating the largest pile in 1 hour)
        for (int pile : piles) {
            high = Math.max(high, pile);
        }

        int optimalSpeed = high;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            
            if (canEatInTime(piles, mid, h)) {
                optimalSpeed = mid; // Record valid speed
                high = mid - 1;     // Keep searching left for a smaller valid speed
            } else {
                low = mid + 1;      // Speed too slow, search right
            }
        }
        
        return optimalSpeed;
    }

    private boolean canEatInTime(int[] piles, int speed, int h) {
        int hours = 0;
        for (int pile : piles) {
            // SDE 3 Trick: Integer ceiling division without Math.ceil() casting
            hours += (pile + speed - 1) / speed; 
        }
        return hours <= h;
    }
}

```