---
title: "202. Happy Number"
date: "2026-03-11"
tags: ["LeetCode", "Coding"]
summary: "Sliding Window 1"
category: "Coding"
sessions:
  - date: "2026-03-11"
    startTime: "20:10"
    endTime: "20:21"
---

# **Fast-Slow:** [Happy Number](https://leetcode.com/problems/happy-number/)

Write an algorithm to determine if a number n is happy.

A happy number is a number defined by the following process:

Starting with any positive integer, replace the number by the sum of the squares of its digits.
Repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1.
Those numbers for which this process ends in 1 are happy.
Return true if n is a happy number, and false if not.

```text
Example 1:

Input: n = 19
Output: true
Explanation:
12 + 92 = 82
82 + 22 = 68
62 + 82 = 100
12 + 02 + 02 = 1
Example 2:

Input: n = 2
Output: false
```

```java
class Solution {
    public boolean isHappy(int n) {
        HashSet<Integer> set = new HashSet<>();
        while(!set.contains(n)){
            set.add(n);
            n = getNextNumber(n);
            if(n==1) return true;
        }
        return false; 
    }
    private int getNextNumber(int n){
        int output =0;
        
        while(n>0){
            int digit=n%10;
            output += digit*digit;
            n=n/10;
        }
        return output;
    }
}
```