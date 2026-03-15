---
title: "Prefix Sum template"
date: "2026-03-15"
tags: ["LeetCode", "Coding", "Prefix sum"]
summary: "prefix sum cheat sheet"
category: "Coding"
sessions:
  - date: "2026-03-15"
    startTime: "11:30"
    endTime: "11:59"
---

---

## 📑 Prefix Sum Patterns Cheat Sheet

### 1. 1D Prefix Sum (Range Sum Query) 📏

**Use Case:** Quick calculation of the sum of any subarray $nums[L...R]$.
**Logic:** Use a 1-based array where `P[i]` is the sum of the first `i` elements.
**Formula:** $Sum(L, R) = P[R + 1] - P[L]$

```java
public class PrefixSum1D {
    private int[] P;

    public PrefixSum1D(int[] nums) {
        int n = nums.length;
        P = new int[n + 1];
        for (int i = 0; i < n; i++) {
            P[i + 1] = P[i] + nums[i];
        }
    }

    public int query(int L, int R) {
        return P[R + 1] - P[L];
    }
}

```

---

### 2. Prefix Sum + Hash Map 🗺️

**Use Case:** Finding the count or length of subarrays that sum to exactly $K$.
**Logic:** As you iterate, store how many times each `currentSum` has occurred. Check if `currentSum - K` exists in the map.
**Key Detail:** Always initialize with `map.put(0, 1)` to catch subarrays starting from index 0.

```java
public int subarraySum(int[] nums, int k) {
    int count = 0, currentSum = 0;
    Map<Integer, Integer> map = new HashMap<>();
    map.put(0, 1); 

    for (int num : nums) {
        currentSum += num;
        if (map.containsKey(currentSum - k)) {
            count += map.get(currentSum - k);
        }
        map.put(currentSum, map.getOrDefault(currentSum, 0) + 1);
    }
    return count;
}

```

---

### 3. 2D Prefix Sum (Matrix Sum Query) 🧊

**Use Case:** Sum of any sub-rectangle from $(r1, c1)$ to $(r2, c2)$.
**Logic:** Inclusion-Exclusion Principle. Subtract the top and left rectangles, then add back the top-left corner that was subtracted twice.

```java
// Query Formula:
// sum = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]

```

---

### 4. Difference Array (Range Updates) 🔄

**Use Case:** Performing many $O(1)$ range updates $[L, R]$ and then getting the final array.
**Logic:** Mark the start with $+V$ and the index after the end ($R+1$) with $-V$.

```java
public void update(int[] diff, int L, int R, int V) {
    diff[L] += V;
    if (R + 1 < diff.length) diff[R + 1] -= V;
}

```

---

### 🛠️ Future Learning

* [ ] **TODO:** Learn **Segment Trees** and **Fenwick Trees (Binary Indexed Trees)**.
* *Why?* To handle cases where the array values change frequently and you still need fast range sum queries ($O(\log N)$ instead of $O(N)$ for updates). 🌳



---