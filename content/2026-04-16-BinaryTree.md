## 🧠 1. FIRST RULE (Your Biggest Fix)

> ❌ **Wrong starting question:** “Which traversal should I use?”
> ✅ **Correct starting question:**
> **“What should my function return?”**

Traversal is a *side effect*.
Return value decides everything.

***

## 🔄 2. MOST IMPORTANT INSIGHT (Your Confidence Breakthrough)

> ✅ **Recursion explores while going down**
> ✅ **Decisions are made while coming back up**

**Never decide left vs right while going down.**
`max(left, right)` happens **only after both sides are fully explored**.

📌 If you remember only ONE line, remember this.

***

## 🚫 3. GREEDY FEAR (Your Biggest Doubt)

### ❌ Fear you had:

> “If I choose left early, I may miss a better path on right later.”

### ✅ Reality:

* Recursion is **NOT greedy**
* It **never commits early**
* It explores **both sides completely**
* Comparison happens **on return**

✅ So **no path is ever missed**.

***

## 🪣 4. CLASSIFY BEFORE SOLVING (Confidence Booster)

Before touching logic, classify the problem:

### 🪣 Bucket 1: **Top–Down (Carry State)**

✅ Path Sum
✅ Root → Leaf existence
✅ Ancestors

**Questions to ask:**

* What state do I pass down?
* Do I stop at leaf?

✅ Return: boolean / void
✅ Global variable: ❌ NO

📌 Example mental line:

> “I carry remaining sum downward.”

***

### 🪣 Bucket 2: **Bottom–Up (Single Return)**

✅ Height
✅ Max root → leaf sum
✅ Is balanced

**Questions to ask:**

* What does parent need from me?

✅ Return: one value
✅ Global variable: ❌ NO

📌 Key rule:

> If answer must include **root**, root’s return = final answer.

***

### 🪣 Bucket 3: **Bottom–Up + Global**

✅ Diameter
✅ Maximum path sum (any node to any node)

**Questions to ask:**

* Can the answer exist anywhere in the tree?
* Can path branch at a node?

✅ Return: **single branch only**
✅ Global variable: ✅ YES

📌 Golden rule:

> Parent can take only one side,
> but global answer can use both.

***

## 🔀 5. GLOBAL vs RETURN (Your Core Confusion — Resolved)

At **every node**, separate these two clearly:

### ✅ Return value (for parent)

* Continuous path
* **Only one direction**
* No branching

### ✅ Global value (for answer)

* Path can **end here**
* Can use **left + node + right**
* Stored separately

📌 One‑liner:

> **Returned path continues upward.
> Global path can die at this node.**

***

## ✅ 6. ROOT → LEAF MAX SUM (Your Doubt Case)

### ❌ Wrong fear:

> “Choosing max(left, right) will miss deeper better path”

### ✅ Correct thinking:

* Left subtree computes its **best full path**
* Right subtree computes its **best full path**
* Root compares **complete answers**

📌 Key sentence:

> “We compare subtree results, not node values.”

✅ Global variable: ❌ NO
✅ Why? Answer **must include root**

***

## 🧪 7. ONE-LINE SELF CHECK (Use in Interview)

Before coding, ask yourself:

1️⃣ Does answer **have to include root**?
→ YES → no global

2️⃣ Can answer be **anywhere** in tree?
→ YES → global needed

3️⃣ Can parent take **both children**?
→ NO → return single branch

If these are clear, solution writes itself.

***

## 🧩 8. YOUR PERSONAL MANTRA (Say This Out Loud)

> **“I will define what my function returns.
> I will explore fully while going down.
> I will decide only while coming back up.”**

This is **your mental stabilizer**.

***

## ✅ 9. WHY YOU WERE NOT CONFIDENT (Truth)

Not because:

* Trees are hard ❌
* You lack logic ❌

But because:

* You didn’t have a **repeatable thinking framework** ✅

Now you do.

***


