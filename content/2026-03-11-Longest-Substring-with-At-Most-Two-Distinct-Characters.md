---
title: "Longest Substring with At Most Two Distinct Characters"
date: "2026-03-11"
tags: ["LeetCode", "Coding", "Sliding Window"]
summary: "Sliding Window 1"
category: "Coding"
sessions:
  - date: "2026-03-11"
    startTime: "17:51"
    endTime: "18:39"
---

# Longest Substring with At Most Two Distinct Characters [](https://www.geeksforgeeks.org/dsa/longest-substring-with-at-most-two-distinct-characters/)

Given a string s, return the length of the longest substring that contains at most two distinct characters.
A substring is a continuous sequence of characters within the string (i.e., characters must appear next to each other without skipping).

```text
Examples:

Input: s = "geeksforgeeks"
Output: 3
Explanation: The substring "gee" is the longest substring containing atmost two distinct character

Input: s = "ccaabbb"
Output: 5
Explanation: The substring "aabbb" is the longest substring containing atmost two distinct character.
```

## intitution

```text
ccaabbb

pick i=0, val: c
        unqiue 1
pick i=1, val: c
        unique 1
pick i=2, val: a 
        unique 2
pick i=3, val a 
        unique 2
pick i=4, val b
        unique =3 (length = 3-0=3 ) , move the first unique -> start = i=2
        unique =2 , 
pick i=5, val b(length= start-i= 2-5)
        unique=2
pick i=6, val : b
        unique =2 length= start- i = 6-2 = 4
     
     



```

```java
import java.util.HashMap;

class Solution {
    public int longSubstring(String s) {
        int n = s.length();
        int maxLen = 0;
        int left = 0;
        HashMap<Character, Integer> map = new HashMap<>();
        
        for(int right=0;right<n;right++){
            map.put(s.charAt(right), map.getOrDefault(s.charAt(right),0)+1);
            
            while(map.size()>2){
                char leftC = map.get(s.charAt(left));
                map.put(leftC, map.getOrDefault(leftC,0)-1);
                if(map.get(leftC)==0){
                    map.remove(leftC);
                }
                left++;
            }
            maxLen = Math.max(maxLen, right-left+1);
        }
        return maxLen;
    }
}
```