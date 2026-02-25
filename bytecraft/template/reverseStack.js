function executeCode(code, lang) {
    return new Promise((resolve, reject) => {

        $.ajax({
            url: "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                source_code: code,
                language_id: lang.language_id,
                stdin: "",
                cpu_time_limit: 5,
                memory_limit: 128000
            }),
            success: function (response) {

                // Convert Judge0 response → Piston-like structure
                resolve({
                    run: {
                        stdout: response.stdout || "",
                        stderr: response.stderr || response.compile_output || "",
                        output:
                            (response.stdout || "") +
                            (response.stderr || "") +
                            (response.compile_output || ""),
                        code: response.status?.id || 0,
                        signal: response.status?.description || null
                    }
                });

            },
            error: function (xhr) {
                reject({
                    run: {
                        stdout: "",
                        stderr: xhr.responseText || "Execution failed",
                        output: xhr.responseText || "Execution failed",
                        code: -1,
                        signal: null
                    }
                });
            }
        });

    });
}


const LANGUAGE_CONFIG = {
    c: { language_id: 50 },
    cpp: { language_id: 54 },
    java: { language_id: 62 },
    kotlin: { language_id: 78 },
    python: { language_id: 71 },
    javascript: { language_id: 63 },
    typescript: { language_id: 74 },
    php: { language_id: 68 },
    ruby: { language_id: 72 },
    rust: { language_id: 73 },
    go: { language_id: 60 },
    csharp: { language_id: 51 },
    swift: { language_id: 83 },
    bash: { language_id: 46 }
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
