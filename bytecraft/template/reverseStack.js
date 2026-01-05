function executeCode(code, lang) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://emkc.org/api/v2/piston/execute",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                language: lang.language,
                version: lang.version,
                files: [{ content: code }]
            }),
            success: resolve,
            error: reject
        });
    });
}

const LANGUAGE_CONFIG = {
    c: { language: "c", version: "10.2.0" },
    cpp: { language: "cpp", version: "10.2.0" },
    java: { language: "java", version: "15.0.2" },
    kotlin: { language: "kotlin", version: "1.8.0" },
    python: { language: "python", version: "3.11.0" },
    javascript: { language: "javascript", version: "18.15.0" },
    typescript: { language: "typescript", version: "5.0.3" },
    php: { language: "php", version: "8.2.3" },
    ruby: { language: "ruby", version: "3.2.2" },
    rust: { language: "rust", version: "1.68.2" },
    go: { language: "go", version: "1.20.2" },
    csharp: { language: "csharp", version: "6.12.0" },
    swift: { language: "swift", version: "5.8.1" },
    bash: { language: "bash", version: "5.2.0" }
};
export async function reverseStack(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    const arrString = testCase.arr.join(", ");

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#define MAX 100

int stack[MAX];
int top = -1;

void push(int x) {
    if (top == MAX - 1) return;
    stack[++top] = x;
}

int pop() {
    if (top == -1) return -1;
    return stack[top--];
}

int isEmpty() {
    return top == -1;
}

void display() {
    for (int i = top; i >= 0; i--)
        printf("%d ", stack[i]);
}

// User's reverse function and helpers injected here
${userCode}

int main(){
    // Reset stack for the test case
    top = -1; 
    int arr[] = {${arrString}};
    int n = ${testCase.size};
    
    for(int i=0; i<n; i++) {
        push(arr[i]);
    }

    // Call user function
    reverse(MAX, top + 1);

    display();
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<stack>
#include<vector>
using namespace std;

// Helper to insert at bottom (optional, but standard for recursion)
void insertAtBottom(stack<int>& st, int item) {
    if (st.empty()) {
        st.push(item);
    } else {
        int top = st.top();
        st.pop();
        insertAtBottom(st, item);
        st.push(top);
    }
}

${userCode}

int main(){
    stack<int> st;
    vector<int> arr = {${arrString}};
    for(int x : arr) st.push(x);

    reverse(st);

    // Display stack (top to bottom)
    while(!st.empty()) {
        cout << st.top() << " ";
        st.pop();
    }
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        Stack<Integer> st = new Stack<>();
        int[] arr = {${arrString}};
        for(int x : arr) st.push(x);

        sol.reverse(st);

        while(!st.isEmpty()) {
            System.out.print(st.pop() + " ");
        }
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
${userCode}

const stack = [${arrString}];
// In JS array, push adds to end (top), pop takes from end (top)
reverse(stack);

// Print from top (end) to bottom (start)
let output = "";
while(stack.length > 0) {
    output += stack.pop() + " ";
}
console.log(output);
`;
    }

    const response = await executeCode(fullcode, lang);

    if (response.run.code !== 0) {
        return {
            passed: false,
            output: response.run.stderr || response.run.output
        };
    }

    return {
        // Trim allows flexibility with trailing spaces
        passed: response.run.output.trim() === testCase.expected.trim(),
        output: response.run.output
    };
}