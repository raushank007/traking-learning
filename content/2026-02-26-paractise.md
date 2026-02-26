---
title: "Pattern wise practise Part I"
date: "2026-02-26"
tags: ["leetcode", "daily practise questions","Two Pointers","Sliding window","Fast-slow"]

---

## Problem 1 : 

> **Prefix Sum:** [Subarray Sums Divisible by K](https://leetcode.com/problems/subarray-sums-divisible-by-k/)

**Step 1: Rephrase problem**
Given integer array `nums` and integer `k`, The **number of non-empty subarray** that have a sum divisble by `k`.

**Step 2: Data structure identification**
given : array , need to find array , need to work on array

**Step 3: Detect pattern**
sum of subarray -> may be perfix sum 

**Step 4: brute force**
1. find all possible subarrays 
2. find the sum of each subrrays 
3. check the sum of each subarray divisble by k -> return count of it

It will take O(n^2) to find all possible subarray -> given max length is 30000 -> TLE with this approach

**Step 5: Optimize using the pattern**
```text
Input : nums = [4,5,0,-2,-3,1], k=5
Output : 7

HashMap = [(0,1)]
count=0

|__ i=0, val:4
|   |__ prefix = 4
|   |__ mod = 4%5 = 4
|   |__ 4<0 ? no
|   |__ map.containsKey(4)? No
|   |__ [(0,1),(4,1)]
|__ i=1, val:5
|   |__ prefix = 9
|   |__ mod = 9%5  = 4
|   |__ 4<0? No
|   |__ map.containsKey(4)? yes
|   |__ count =1
|   |__ [(0,1),(4,2)]
|__ i=2 , val:0
|   |__ prefix = 9
|   |__ mod = 9%5 = 4
|   |__ 4<0 ? No
|   |__ map.containsKey(4)? Yes
|       |__ count =3
|       |__ [(0,1),(4,3)]
|__ i=3, val: -2
|   |__ prefix = 7
|   |__ mod = 7%5 = 2
|   |__ 2<0? No
|   |__ map.containsKey(2)? No
|   |__ [(0,1),(4,3),(2,1)]
|__ i==4 , val:-3
|   |__ prefix = 4
|   |__ mod = 4%5 = 4
|   |__ 4<0? No
|   |__ map.containsKey(4)? Yes
|       |__ count = 6
|       |__ [(0,1),(4,4),(2,1)]
|__ i = 5, val :1
    |__ prefix = 5
    |__ mod = 5%5=0
    |__ 0<0?No
    |__ map.containsKey(0)? yes
        |__ count =7
        |__ [(0,2),(4,4),(2,1)]
        
count = 7;

    




```

```java
class Solution{
    public int subarraysDivByK(int[] nums, int k){
        int count=0;
        int prefixSum=0;
        HashMap<Integer,Integer> prefixMap = new HashMap<>();
        prefixMap.put(0,1);
        
        for(int num : nums){
            prefixSum  += num;
            int mod = prefixSum%k;
            if(mod<0) mod +=k;
            if(prefixMap.containsKey(mod)){
                count += prefixMap.get(mod);
                prefixMap.put(mod, prefixMap.get(mod)+1);
            }else{
                prefixMap.put(mod,1);
            }
        }
        return count;
    }
}
```
