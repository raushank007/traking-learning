---
title: "525. Contiguous Array"
date: "2026-03-12"
tags: ["LeetCode", "Coding", "Prefix sum"]
summary: "Prefix sum 1"
category: "Coding"
sessions:
  - date: "2026-03-12"
    startTime: "16:37"
    endTime: "16:59"
---

# [Contiguous Array](https://leetcode.com/problems/contiguous-array/)

Given a binary array nums, return the maximum length of a contiguous subarray with an equal number of 0 and 1

```text
Example 1:

Input: nums = [0,1]
Output: 2
Explanation: [0, 1] is the longest contiguous subarray with an equal number of 0 and 1.
Example 2:

Input: nums = [0,1,0]
Output: 2
Explanation: [0, 1] (or [1, 0]) is a longest contiguous subarray with equal number of 0 and 1.
Example 3:

Input: nums = [0,1,1,1,1,1,0,0,0]
Output: 6
Explanation: [1,1,1,0,0,0] is the longest contiguous subarray with equal number of 0 and 1.
 

Constraints:

1 <= nums.length <= 105
nums[i] is either 0 or 1.
```
---

### **Problem 525. Contiguous Array**


**1. The "Why" (The Core Intuition):**
By replacing all `0`s with `-1`s, the problem translates into finding the longest subarray with a sum of `0`.
As we calculate the running prefix sum, if we encounter the same sum at index `i` and later at index `j`, it means the elements strictly between `i` and `j` cancel each other out (sum to 0). To maximize the length, we use a HashMap to store the *first* occurrence (earliest index) of every prefix sum we see.

**2. Complexity:**

* **Time:** $O(N)$ — We iterate through the array exactly once. HashMap `put` and `containsKey` operations take $O(1)$ time on average.
* **Space:** $O(N)$ — In the worst case (an array of all `0`s or all `1`s), every prefix sum is unique, and we store $N$ entries in the HashMap.

**3. State Trace (Tabular Method):**
`nums = [0, 1, 0]`

| `i` | `nums[i]` | `sum` | `mp` (Current State) | Condition Met | Action / Update | `subArrayLength` |
| --- | --- | --- | --- | --- | --- | --- |
| **0** | `0` (val: -1) | `-1` | `{}` | `else` (New sum) | `mp.put(-1, 0)` | `0` |
| **1** | `1` (val: 1) | `0` | `{-1: 0}` | `if (sum == 0)` | `subArrayLength = 1 + 1` | `2` |
| **2** | `0` (val: -1) | `-1` | `{-1: 0}` | `else if (mp.contains(-1))` | `max(2, 2 - mp.get(-1))` $\rightarrow \max(2, 2 - 0)$ | `2` |

**Final Answer:** `2`

**4. Clean Code (Java):**

```java
class Solution {
    public int findMaxLength(int[] nums) {
        int n = nums.length;
        Map<Integer, Integer> mp = new HashMap<>();
        int sum = 0;
        int subArrayLength = 0;
        
        for (int i = 0; i < n; i++) {
            sum += nums[i] == 0 ? -1 : 1;
            
            if (sum == 0) {
                // If sum is 0, the subarray from index 0 to i is balanced.
                subArrayLength = i + 1;
            } else if (mp.containsKey(sum)) {
                // If we've seen this sum before, calculate the distance from its first occurrence.
                subArrayLength = Math.max(subArrayLength, i - mp.get(sum));
            } else {
                // Only store the FIRST occurrence to maximize subarray length.
                mp.put(sum, i);
            }
        }
        return subArrayLength;
    }
}

```