---
title: "TreeMap and TreeSet"
date: "2026-03-14"
tags: ["Java", "Collections"]
summary: "TreeMap and TreeSet internal work"
category: "java"
sessions:
  - date: "2026-03-14"
    startTime: "14:46"
    endTime: "15:42"
---

### 🗺️ `TreeMap` & `TreeSet` 


### Topic 1: The Baseline - Why use `TreeMap`?

In our previous discussions, we established that a standard `HashMap` provides lightning-fast $O(1)$ lookups, but completely scrambles the order of your data. We also saw that `LinkedHashMap` preserves the exact *insertion* order or *access* order.

But what if you need your data dynamically **sorted** by its actual value?

For example, what if you are building a system that needs to constantly fetch the "top 10 highest scores," find the "closest date to today," or iterate through user IDs in strict alphabetical order?

Neither `HashMap` nor `LinkedHashMap` can do this efficiently. If you want to find the minimum or maximum key in a `HashMap`, you have to iterate through the entire set of keys, resulting in $O(n)$ time complexity.

This is where `TreeMap` steps in. A `TreeMap` guarantees that its keys are always perfectly sorted, either by their natural ordering (e.g., 1, 2, 3... or A, B, C...) or by a custom `Comparator` you provide when creating the map.

To achieve this constant state of sorted perfection, `TreeMap` completely abandons the concept of a hash table array. It doesn't use hash codes at all. Instead, it places every key-value pair into a self-balancing Binary Search Tree.

>we need to understand the danger it prevents. Let's look at a standard, naive Binary Search Tree. If you insert sequential, already-sorted data like `10, 20, 30, 40, 50` into a standard Binary Search Tree, what physical shape does the tree take in memory, and what exactly happens to your expected $O(\log n)$ search time?
> A skewed BST is essentially just a linked list. Your expected $O(\log n)$ search time is completely destroyed, and you are stuck with $O(n)$ performance.

---

### Topic 2: The Wrapper Secret - How `TreeSet` is implemented

Before we dive into how Java fixes that skewed tree problem, we need to address `TreeSet`.

In Java, `TreeSet` is essentially an illusion. It does not have its own unique, complex internal architecture. Just like `HashSet` is backed by a `HashMap`, a `TreeSet` is entirely backed by a `TreeMap`.

When you instantiate a `TreeSet` and call `add("Apple")`, Java actually inserts "Apple" as a **key** into a hidden, internal `TreeMap`. Because a map requires both a key and a value, Java just pairs your key with a constant, dummy `Object` (internally called `PRESENT`).

* **The Interview Takeaway:** When an interviewer asks you about `TreeSet` internals, they are actually asking you about `TreeMap` internals. By learning how `TreeMap` balances itself, you are mastering both data structures simultaneously.

---

### Topic 3: Red-Black Trees 101

To completely eliminate the risk of a skewed $O(n)$ tree, `TreeMap` implements a **Red-Black Tree**. This is a specific type of self-balancing binary search tree.

Whenever you insert or delete a node, the tree actively checks its own shape. If it detects that one branch is getting too long compared to the others, it physically rotates the nodes and reassigns them to restore balance, guaranteeing a worst-case time complexity of $O(\log n)$ for `containsKey`, `get`, `put`, and `remove` operations.

Before we look at the complex mathematical rules that trigger those rotations, let's establish the physical anatomy of the nodes themselves.

>In a standard Binary Search Tree, a node holds its `key`, its `value`, a `left` pointer, and a `right` pointer. To transform this into a *Red-Black* Tree, `TreeMap` modifies the internal `Map.Entry` class. What specific, extra piece of metadata must be added to every single node to make the Red-Black balancing algorithm possible?

The order itself is naturally maintained by the left/right structure of the binary tree (smaller keys go left, larger keys go right).

To make it a *Red-Black* tree, `TreeMap` actually adds two very specific pieces of metadata to the standard tree node:

1. **A `color` property:** Typically a simple boolean flag representing Red or Black.
2. **A `parent` pointer:** A reference pointing back up to the node's parent, which is strictly required to navigate up the tree during balancing operations.

---

### Topic 4: The 5 Golden Rules

Now that we have nodes with a color and a parent pointer, we arrive at the absolute core of `TreeMap` interview questions: The rules that guarantee $O(\log n)$ performance.

A Red-Black tree stays balanced by strictly enforcing these **5 Golden Rules**. If any operation breaks one of these rules, the tree immediately pauses and fixes itself before allowing the next operation.

Here are the rules you should commit to memory:

1. **Rule 1:** Every node is either red or black.
2. **Rule 2:** The root of the tree is always black.
3. **Rule 3:** Every leaf (an empty, `null` NIL node at the bottom) is considered black.
4. **Rule 4:** If a node is red, both of its children must be black. (Meaning: You can **never** have two red nodes in a row).
5. **Rule 5 (Black-Height Rule):** Every path from a given node down to any of its descendant NIL leaves must contain the exact same number of black nodes.

Let's test the mechanics of these rules because this is exactly how an interviewer will probe your understanding.

When you insert a brand new node into a `TreeMap`, the algorithm **always initially colors it Red**.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Red-Black Tree 5 Golden Rules Visualization</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f7f6;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        h1 {
            color: #333;
        }

        .visualization-container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            width: 80%;
            max-width: 900px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        svg {
            border: 1px solid #ddd;
            margin-bottom: 20px;
        }

        .node-circle {
            stroke: #333;
            stroke-width: 2px;
        }

        .node-text {
            fill: #fff;
            font-weight: bold;
            font-size: 16px;
            text-anchor: middle;
            dominant-baseline: central;
        }

        .link-line {
            stroke: #999;
            stroke-width: 2px;
        }

        .label-text {
            fill: #333;
            font-size: 14px;
            text-anchor: middle;
        }

        .label-arrow {
            fill: none;
            stroke: #555;
            stroke-width: 1px;
            marker-end: url(#arrowhead);
        }

        .rule-explanation {
            border-top: 1px solid #eee;
            padding-top: 15px;
            margin-top: 15px;
            width: 100%;
        }

        .rule-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #4a148c;
        }

        .status-message {
            font-style: italic;
            color: #d32f2f; /* Dark Red */
            margin-top: 10px;
        }

        .status-message.compliant {
            color: #388e3c; /* Dark Green */
        }

        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }

        button {
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: background-color 0.2s;
        }

        button:hover {
            opacity: 0.9;
        }

        #refreshBtn {
            background-color: #757575;
            color: #fff;
        }

        #pauseBtn {
            background-color: #fbc02d; /* Yellow */
            color: #333;
        }

        #nextBtn {
            background-color: #007bff;
            color: #fff;
        }

        #prevBtn {
            background-color: #e0e0e0;
            color: #333;
        }

        /* Marker for labels */
        svg defs marker#arrowhead {
            fill: #555;
        }
    </style>
</head>
<body>

<h1>Red-Black Tree: 5 Golden Rules Visualization</h1>

<div class="visualization-container">
    <div class="controls">
        <button id="refreshBtn">🔄 Refresh</button>
        <button id="pauseBtn">⏸️ Pause</button>
        <button id="prevBtn">⬅️ Previous Rule</button>
        <button id="nextBtn">Next Rule ➡️</button>
    </div>

    <svg id="rbtSvg" width="800" height="400">
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
        </defs>
    </svg>

    <div class="rule-explanation">
        <div id="ruleTitle" class="rule-title"></div>
        <div id="ruleText"></div>
        <div id="statusMessage" class="status-message"></div>
    </div>
</div>

<script>
    const rules = [
        {
            title: "Rule 1: Node Color",
            text: "Every node is either red or black.",
            scenario: 'allColored',
            violation: 'A node has no color.',
            explanation: "Each node must have a distinct color: Red or Black."
        },
        {
            title: "Rule 2: Root Color",
            text: "The root of the tree is always black.",
            scenario: 'rootViolation',
            violation: 'Tree root is currently red.',
            explanation: "The algorithm enforces that the root node must be black."
        },
        {
            title: "Rule 3: Leaf Color",
            text: "Every leaf (empty, null NIL node) is considered black.",
            scenario: 'leafViolation',
            violation: 'One NIL leaf is mistakenly colored red.',
            explanation: "All leaf nodes (representing null references) are treated as if they were black."
        },
        {
            title: "Rule 4: Consecutive Reds",
            text: "If a node is red, both of its children must be black.",
            scenario: 'consecutiveReds',
            violation: 'Two consecutive red nodes!',
            explanation: "This rule prevents a long path of only red nodes. A red node cannot have a red child."
        },
        {
            title: "Rule 5: Black-Height Rule",
            text: "Every path from a given node to its descendant NIL leaves must contain the exact same number of black nodes.",
            scenario: 'blackHeightViolation',
            violation: 'Different black nodes count along paths.',
            explanation: "This is the most critical rule for balance. It guarantees that no path is more than twice as long as another."
        }
    ];

    let currentRuleIndex = -1;
    let isPaused = false;
    let showFixedState = false;

    const svg = document.getElementById('rbtSvg');
    const ruleTitleEl = document.getElementById('ruleTitle');
    const ruleTextEl = document.getElementById('ruleText');
    const statusMessageEl = document.getElementById('statusMessage');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const refreshBtn = document.getElementById('refreshBtn');

    const NODE_RADIUS = 20;
    const LEVEL_HEIGHT = 80;

    function clearSvg() {
        while (svg.firstChild) {
            if (svg.firstChild.id !== 'arrowhead-def') { // Keep the arrow definition
                svg.removeChild(svg.firstChild);
            } else {
                break;
            }
        }
        // re-add defs if needed, though they are kept
    }

    function createNode(x, y, label, color, isLeaf = false) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute('transform', `translate(${x}, ${y})`);
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('class', 'node-circle');
        circle.setAttribute('r', isLeaf ? NODE_RADIUS * 0.7 : NODE_RADIUS);
        circle.setAttribute('fill', color);
        group.appendChild(circle);

        if (!isLeaf) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute('class', 'node-text');
            text.textContent = label;
            group.appendChild(text);
        } else {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute('class', 'node-text');
            text.setAttribute('font-size', '12px');
            text.textContent = "NIL";
            group.appendChild(text);
        }
        return group;
    }

    function createLink(x1, y1, x2, y2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('class', 'link-line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        return line;
    }

    function createLabel(x, y, text) {
        const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textEl.setAttribute('class', 'label-text');
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        textEl.textContent = text;
        return textEl;
    }

    function drawScenario() {
        clearSvg();
        const rule = rules[currentRuleIndex];
        if (!rule) return;

        ruleTitleEl.textContent = rule.title;
        ruleTextEl.innerHTML = `<p>${rule.text}</p><p>${rule.explanation}</p>`;
        statusMessageEl.textContent = rule.violation;
        statusMessageEl.classList.remove('compliant');

        let treeFixed = false;
        if (showFixedState) {
            treeFixed = true;
            statusMessageEl.textContent = 'Corrected and Compliant.';
            statusMessageEl.classList.add('compliant');
        }

        const centerX = svg.width.baseVal.value / 2;
        const y0 = 50;

        // Scenario-specific data & drawing logic
        switch (rule.scenario) {
            case 'allColored':
                // A simple 3-node tree to show each node must be colored
                svg.appendChild(createLink(centerX, y0, centerX - LEVEL_HEIGHT, y0 + LEVEL_HEIGHT));
                svg.appendChild(createLink(centerX, y0, centerX + LEVEL_HEIGHT, y0 + LEVEL_HEIGHT));
                svg.appendChild(createNode(centerX, y0, "20", "black"));
                svg.appendChild(createNode(centerX - LEVEL_HEIGHT, y0 + LEVEL_HEIGHT, "10", "red"));
                svg.appendChild(createNode(centerX + LEVEL_HEIGHT, y0 + LEVEL_HEIGHT, "30", "red"));
                break;
            case 'rootViolation':
                // Simple path violating Rule 2
                svg.appendChild(createLink(centerX, y0, centerX + LEVEL_HEIGHT, y0 + LEVEL_HEIGHT));
                svg.appendChild(createNode(centerX, y0, "20", treeFixed ? "black" : "red"));
                svg.appendChild(createNode(centerX + LEVEL_HEIGHT, y0 + LEVEL_HEIGHT, "30", "red"));
                break;
            case 'leafViolation':
                // Path with a faulty NIL leaf
                svg.appendChild(createLink(centerX, y0, centerX + LEVEL_HEIGHT, y0 + LEVEL_HEIGHT));
                svg.appendChild(createNode(centerX, y0, "20", "black"));
                
                const leafX = centerX + LEVEL_HEIGHT;
                const leafY = y0 + LEVEL_HEIGHT;
                svg.appendChild(createNode(leafX, leafY, "30", treeFixed ? "black" : "red", true));
                break;
            case 'consecutiveReds':
                // Root is Black, then Red, then faulty Red child
                svg.appendChild(createLink(centerX, y0, centerX - LEVEL_HEIGHT, y0 + LEVEL_HEIGHT));
                svg.appendChild(createNode(centerX, y0, "20", "black"));
                const node10X = centerX - LEVEL_HEIGHT;
                const node10Y = y0 + LEVEL_HEIGHT;
                svg.appendChild(createLink(node10X, node10Y, node10X - LEVEL_HEIGHT * 0.7, node10Y + LEVEL_HEIGHT * 0.7));
                svg.appendChild(createNode(node10X, node10Y, "10", treeFixed ? "black" : "red"));
                const node5X = node10X - LEVEL_HEIGHT * 0.7;
                const node5Y = node10Y + LEVEL_HEIGHT * 0.7;
                svg.appendChild(createNode(node5X, node5Y, "5", "red"));
                break;
            case 'blackHeightViolation':
                // Path violating Rule 5
                svg.appendChild(createLink(centerX, y0, centerX - LEVEL_HEIGHT, y0 + LEVEL_HEIGHT));
                svg.appendChild(createLink(centerX, y0, centerX + LEVEL_HEIGHT, y0 + LEVEL_HEIGHT));
                svg.appendChild(createNode(centerX, y0, "20", "black"));
                // Path 1
                svg.appendChild(createNode(centerX - LEVEL_HEIGHT, y0 + LEVEL_HEIGHT, "10", treeFixed ? "black" : "red"));
                // Path 2
                svg.appendChild(createNode(centerX + LEVEL_HEIGHT, y0 + LEVEL_HEIGHT, "30", "red"));
                break;
            default:
                console.warn("Unknown scenario:", rule.scenario);
        }
    }

    function updateStep() {
        showFixedState = false; // Always show violation first
        drawScenario();
    }

    function nextRule() {
        currentRuleIndex++;
        if (currentRuleIndex >= rules.length) {
            currentRuleIndex = -1; // End of list
            ruleTitleEl.textContent = 'All 5 Golden Rules covered!';
            ruleTextEl.innerHTML = '<p>You can refresh to start over or review specific rules.</p>';
            statusMessageEl.textContent = '';
            clearSvg();
            return;
        }
        showFixedState = false;
        drawScenario();
    }

    function prevRule() {
        currentRuleIndex--;
        if (currentRuleIndex < 0) {
            currentRuleIndex = rules.length - 1;
        }
        showFixedState = false;
        drawScenario();
    }

    nextBtn.addEventListener('click', nextRule);
    prevBtn.addEventListener('click', prevRule);
    refreshBtn.addEventListener('click', () => { currentRuleIndex = -1; nextRule(); });
    pauseBtn.addEventListener('click', () => {
        showFixedState = !showFixedState;
        pauseBtn.textContent = showFixedState ? "▶️ Fix State" : "⏸️ Violation State";
        drawScenario();
    });

    nextRule(); // Show the first rule on load
</script>
</body>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TreeMap Array Insertion Engine</title>
    <style>
        body { font-family: sans-serif; background-color: #f4f4f9; display: flex; flex-direction: column; align-items: center; margin-top: 20px; }
        .array-container { display: flex; gap: 10px; margin-bottom: 20px; font-size: 20px; font-weight: bold; }
        .array-element { padding: 10px 20px; background-color: white; border: 2px solid #333; border-radius: 5px; transition: opacity 0.3s; }
        .consumed { opacity: 0.2; text-decoration: line-through; }
        canvas { background-color: white; border: 2px solid #333; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        #status { margin-top: 20px; font-size: 1.2rem; font-weight: bold; color: #333; height: 30px;}
        button { margin-top: 15px; padding: 10px 20px; font-size: 1rem; cursor: pointer; background-color: #007BFF; color: white; border: none; border-radius: 4px; }
        button:hover { background-color: #0056b3; }
    </style>
</head>
<body>

    <h2>TreeMap Insertion: Array to Red-Black Tree</h2>
    
    <div class="array-container" id="arrayUI">
        <div class="array-element" id="arr-0">10</div>
        <div class="array-element" id="arr-1">20</div>
        <div class="array-element" id="arr-2">30</div>
        <div class="array-element" id="arr-3">15</div>
    </div>

    <canvas id="treeCanvas" width="700" height="400"></canvas>
    <div id="status">Ready to begin insertion.</div>
    <button onclick="nextStep()">Next Step ➡️</button>

    <script>
        const canvas = document.getElementById('treeCanvas');
        const ctx = canvas.getContext('2d');
        const statusText = document.getElementById('status');

        let step = 0;
        let animationFrameId;

        // Tree state
        let nodes = {};

        function drawNode(x, y, val, color) {
            ctx.beginPath();
            ctx.arc(x, y, 22, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#333';
            ctx.stroke();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(val, x, y);
        }

        function drawLine(startX, startY, endX, endY) {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#666';
            ctx.stroke();
        }

        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw lines first
            if (nodes[10] && nodes[20] && step >= 3 && step <= 7) drawLine(nodes[10].x, nodes[10].y, nodes[20].x, nodes[20].y);
            if (nodes[20] && nodes[30] && step >= 5 && step <= 7) drawLine(nodes[20].x, nodes[20].y, nodes[30].x, nodes[30].y);
            
            // Post-rotation lines
            if (step >= 8) {
                drawLine(nodes[20].x, nodes[20].y, nodes[10].x, nodes[10].y);
                drawLine(nodes[20].x, nodes[20].y, nodes[30].x, nodes[30].y);
            }
            // 15 connects to 10
            if (nodes[15] && step >= 10) {
                drawLine(nodes[10].x, nodes[10].y, nodes[15].x, nodes[15].y);
            }

            // Draw nodes
            for (let key in nodes) {
                let n = nodes[key];
                drawNode(n.x, n.y, n.val, n.color);
            }
        }

        function animate() {
            let isMoving = false;
            for (let key in nodes) {
                let n = nodes[key];
                n.x += (n.targetX - n.x) * 0.1;
                n.y += (n.targetY - n.y) * 0.1;
                if (Math.abs(n.targetX - n.x) > 1 || Math.abs(n.targetY - n.y) > 1) isMoving = true;
            }
            render();
            if (isMoving) animationFrameId = requestAnimationFrame(animate);
        }

        function nextStep() {
            cancelAnimationFrame(animationFrameId);
            
            switch(step) {
                case 0:
                    document.getElementById('arr-0').classList.add('consumed');
                    nodes[10] = { x: 350, y: 50, val: 10, color: 'red', targetX: 350, targetY: 50 };
                    statusText.innerText = "Pop 10: Inserted as Red (Default).";
                    break;
                case 1:
                    nodes[10].color = 'black';
                    statusText.innerText = "Check: Rule 2 Violation (Root must be Black). Fixed.";
                    break;
                case 2:
                    document.getElementById('arr-1').classList.add('consumed');
                    statusText.innerText = "Pop 20: Reading value...";
                    break;
                case 3:
                    nodes[20] = { x: 450, y: 120, val: 20, color: 'red', targetX: 450, targetY: 120 };
                    statusText.innerText = "Insert 20: Goes right of 10. Valid state.";
                    break;
                case 4:
                    document.getElementById('arr-2').classList.add('consumed');
                    statusText.innerText = "Pop 30: Reading value...";
                    break;
                case 5:
                    nodes[30] = { x: 550, y: 190, val: 30, color: 'red', targetX: 550, targetY: 190 };
                    statusText.innerText = "Insert 30: Goes right of 20. 🚨 Double-Red Violation!";
                    break;
                case 6:
                    statusText.innerText = "Fix: Uncle is NIL (Black). Line formed. Left Rotate on 10!";
                    nodes[20].targetX = 350; nodes[20].targetY = 50;
                    nodes[10].targetX = 250; nodes[10].targetY = 120;
                    nodes[30].targetX = 450; nodes[30].targetY = 120;
                    animate();
                    break;
                case 7:
                    nodes[20].color = 'black'; nodes[10].color = 'red';
                    statusText.innerText = "Fix: Swap Colors. Balanced.";
                    break;
                case 8:
                    document.getElementById('arr-3').classList.add('consumed');
                    statusText.innerText = "Pop 15: Reading value...";
                    break;
                case 9:
                    nodes[15] = { x: 320, y: 190, val: 15, color: 'red', targetX: 320, targetY: 190 };
                    statusText.innerText = "Insert 15: Left of 20, Right of 10. 🚨 Double-Red Violation!";
                    break;
                case 10:
                    statusText.innerText = "Fix: Uncle (30) is RED. Case 1 triggered. Color Flip only!";
                    break;
                case 11:
                    nodes[10].color = 'black'; nodes[30].color = 'black'; 
                    // 20 is root, so it stays black despite the flip rule.
                    statusText.innerText = "Color Flip Complete: Parent (10) & Uncle (30) become Black. Balanced.";
                    break;
                default:
                    statusText.innerText = "Array fully inserted! Refresh to replay.";
            }
            if (step !== 6) render(); // Animate handles render for step 6
            step++;
        }
        render();
    </script>
</body>
</html>
```