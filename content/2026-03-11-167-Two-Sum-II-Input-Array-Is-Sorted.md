---
title: "167. Two Sum II - Input Array Is Sorted"
date: "2026-03-11"
tags: ["LeetCode", "Coding", "Two pointer"]
summary: "Two pointer 1"
category: "Coding"
sessions:
  - date: "2026-03-11"
    startTime: "17:30"
    endTime: "17:50"
---

# Problem 167. Two Sum II - Input Array Is Sorted

>**Two Pointers:** [Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)

```text

[2,7,11,15] , target = 9
start=0, end=3
|__ start=0,(val:2) end =3(val:15)
|   |__ if(2+15=17 , 17>9) -> end--; -> 2
|   |__ start=0, (val:2) , end=2(val:11)
|   |__ if(2+11=13, 13>9) -> end--; -> 1
|   |__ start=0, (val:2) , end=1(val:7)
|   |__ if(2+7=9 -> 9) ans start+1, end+1 (1,2)
```

## Pattern -> Two pointer

```java
class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int start=0;
        int n = numbers.length;
        int end=n-1;

        while(end>start){
            if(numbers[start]+numbers[end]==target) return new int[]{start+1,end+1};
            else if(numbers[start]+numbers[end]>target) end--;
            else start++;
        }
        return new int[]{-1,-1};
    }
}
```