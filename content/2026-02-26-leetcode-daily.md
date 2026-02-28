---
title: "1404. Number of steps to reduce a number in Binary representation to one"
date: "2026-02-26"
tags: ["leetcode", "daily"]
summary: "Problem link : https://leetcode.com/problems/number-of-steps-to-reduce-a-number-in-binary-representation-to-one/"
category: "Coding"
---


## Problem 

>Given Binary representation of an integer as a string `s`, return number of steps to reduce to `1` 
> if current number is even , you have to divide it by `2`
> if current number is odd , you need to add `1` to it


```text
Example
Input s = "1101"
Output: 6

Explanation:
"1101" -> 13 
step 1 -> 13 -> odd -> add 1 -> 14 -> 
step 2 -> 14 -> even -> divide by 2 -> 7
step 3 -> 7 is odd -> add 1 -> 8
step 4 -> 8 is even -> divide by 2 -> 4
step 5 -> 4 is even -> divide by 2 -> 2
step 6 -> 2 is even -> divide by 2 -> 1
```

## inititution

```text
for checking even and odd
Last bit = 1 -> odd
Last bit = 0 -> even

Divide by 2  -> right shift by 1 -> drop the last bit
Example => 1110 (14) -> 111(7)

Add 1 
Walk from the rightmost bit to the left 
flip trailing 1s to 0 until you find a 0 , then turn that 0 into 1
if all bits were 1 , append 1 

"1101" -> 13 ("1101")
step 1 -> 13 -> odd -> add 1 -> 14 -> (1110)
step 2 -> 14 -> even -> divide by 2 -> 7 (111)
step 3 -> 7 is odd -> add 1 -> 8(1000)
step 4 -> 8 is even -> divide by 2 -> 4(100)
step 5 -> 4 is even -> divide by 2 -> 2(10)
step 6 -> 2 is even -> divide by 2 -> 1(1)


```
### puesudo code
```Java
public class{
    public int numSteps(String s){
        int count=0;
        while(s.length()>1){
            if(s.charAt(s.length()-1)=='0'){
                s = divideBy2(s);
            }else{
                s = incrementBy1(s);
            }
            count++;
        }
        
    }
private String  divideBy2(String s){
    return s.subString(0,s.length()-1);
}
private String incrementBy1(String s){
    StringBuilder sb = new StringBuilder();
    char carry ='1';
    for(int i=s.length()-1;i>=0;i--){
        if(carry=='1' && s.charAt(i)=='1'){
            carry='1';
            sb.append('0');
        }else if(carry=='1' && s.charAt(i)=='0'){
            carry=='0';
            sb.append('0');
        }else if(carry=='0' && s.charAt(i)=='1'){
            carry=='0';
            sb.append('1');
        }else if(carry=='0' && s.charAt(i)=='0'){
            carry=='0';
            sb.append('0');
        }

        if(carry=='1) sb.append('1');
        return sb.reverse().toString();

    }
    }

```

