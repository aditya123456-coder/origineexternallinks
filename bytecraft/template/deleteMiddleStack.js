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

export async function deleteMiddleStack(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Format array for injection
    const arrString = testCase.arr.join(", ");

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

struct Node* top = NULL;

void push(int val) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = val;
    newNode->next = top;
    top = newNode;
}

${userCode}

int main(){
    int arr[] = {${arrString}};
    int size = ${testCase.size};
    
    // We push in order so the last element of array becomes Top? 
    // Or iterate normally? 
    // Let's assume input array is [bottom, ..., top].
    // So iterating 0 to size-1 and pushing makes arr[size-1] the TOP.
    // However, typical test cases often list [Top, Next, ...].
    // Let's standardize: If Input is [10, 20, 30] and we want 10 to be top,
    // we must push 30, then 20, then 10.
    // So we iterate backwards.
    
    for(int i = size - 1; i >= 0; i--) {
        push(arr[i]);
    }

    printf("%d", deleteMiddle());
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(NULL) {}
};

Node* top = NULL;

void push(int val) {
    Node* newNode = new Node(val);
    newNode->next = top;
    top = newNode;
}

${userCode}

int main(){
    vector<int> arr = {${arrString}};
    
    // Push backwards to ensure arr[0] is at the TOP
    for(int i = arr.size() - 1; i >= 0; i--) {
        push(arr[i]);
    }

    cout << deleteMiddle();
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

class Node {
    int data;
    Node next;
    Node(int d) { data = d; next = null; }
}

public class Main {
    static Node top = null;

    static void push(int val) {
        Node newNode = new Node(val);
        newNode.next = top;
        top = newNode;
    }

    ${userCode}

    public static void main(String[] args) {
        int[] arr = {${arrString}};
        
        for(int i = arr.length - 1; i >= 0; i--) {
            push(arr[i]);
        }

        System.out.print(deleteMiddle());
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

let top = null;

function push(val) {
    let newNode = new Node(val);
    newNode.next = top;
    top = newNode;
}

${userCode}

const arr = [${arrString}];

// Push backwards so arr[0] is TOP
for(let i = arr.length - 1; i >= 0; i--) {
    push(arr[i]);
}

console.log(deleteMiddle());
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
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };

}
