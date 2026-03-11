---
title: "39. Combination Sum"
date: "2026-03-11"
tags: ["LeetCode", "Coding", "Backtracking"]
summary: "backtracking 1"
category: "Coding"
sessions:
  - date: "2026-03-11"
    startTime: "09:02"
    endTime: "09:10"
---

# Combination Sum

Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order.

The same number may be chosen from candidates an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.

The test cases are generated such that the number of unique combinations that sum up to target is less than 150 combinations for the given input.
```text
Example 1:

Input: candidates = [2,3,6,7], target = 7
Output: [[2,2,3],[7]]
Explanation:
2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times.
7 is a candidate, and 7 = 7.
These are the only two combinations.
Example 2:

Input: candidates = [2,3,5], target = 8
Output: [[2,2,2,2],[2,3,3],[3,5]]
Example 3:

Input: candidates = [2], target = 1
Output: []
```

## Rephrase problem

from given array need to find all the possible array , repeating each index element as much as possible to get the target sum , all resultant array should be unique

## Pattern -> Backtracking

pick and notPick 

when we pick the element, don't increase the index , substract it it from target
and for not pick only increase the index

```java
class Solution{
    public List<List<Integer>> allPossibleCombinationSum(int[] arr, int target){
        List<List<Integer>> result = new ArrayList<>();
        List<Integer> ans = new ArrayList<>();
        backtracking(0,target,arr,result,ans);
        return result;
    }
    private void backtracking(int index,int target,int[] arr, List<List<Integer>> result, List<Integer> ans){
        if(target==0){
            result.add(new ArrayList<>(ans));
            return;
        }
        if(index>arr.length || target<0) return;
        
        ans.add(arr[index]);
        backtracking(index,target-arr[index],arr,result, ans);
        ans.remove(ans.size()-1);
        backtracking(index+1,target,arr,result,ans);
    }
}
```